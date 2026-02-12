import { IAuthPayload, winstonLogger } from '@emrecolak-23/jobber-share';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import StatusCodes from 'http-status-codes';
import http from 'http';
import { CustomError, IErrorResponse } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';
import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@gig/loaders';
import { verify } from 'jsonwebtoken';
import { appRoutes } from '@gig/routes';
import { Channel } from 'amqplib';
import { QueueConnection } from '@gig/queues';
import { GigConsumer } from '@gig/queues/gig.consumer';

const SERVER_PORT = 4004;

export let gigChannel: Channel;

@singleton()
@injectable()
export class GigServer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiGigServer', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly elasticSearch: ElasticSearch,
    private readonly queueConnection: QueueConnection,
    private readonly gigConsumer: GigConsumer
  ) {}

  public start(app: Application): void {
    this.securityMiddleware(app);
    this.standartMiddleware(app);
    this.routesMiddleware(app);
    this.startsElasticSearch();
    this.startQueues();
    this.errorHandler(app);
    this.startServer(app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: `${this.config.API_GATEWAY_URL}`,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
      })
    );
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const payload = verify(token, this.config.JWT_TOKEN) as IAuthPayload;
        req.currentUser = payload;
      }

      next();
    });
  }

  private standartMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '200mb' }));
    app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  }

  private startsElasticSearch(): void {
    this.elasticSearch.checkConnection();
    this.elasticSearch.createIndex('gigs');
  }

  private async startQueues(): Promise<void> {
    gigChannel = await this.queueConnection.getChannel();
    await this.gigConsumer.consumeGigDirectMessage(gigChannel);
    await this.gigConsumer.consumeSeedDirectMessage(gigChannel);
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private errorHandler(app: Application): void {
    app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.log.log('error', `${fullUrl} endpoint does not exists`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: `The endpoint called does not exist` });
      next();
    });

    app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      const errorLog: Record<string, unknown> =
        err instanceof CustomError
          ? {
              message: err.message,
              statusCode: err.statusCode,
              comingFrom: err.comingFrom
            }
          : {
              message: err.message,
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              comingFrom: 'GigService errorHandler'
            };

      this.log.log('error', `GigService ${err.comingFrom}: `, errorLog);

      if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.serializeError());
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: 'error',
        comingFrom: 'GigService errorHandler'
      });
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      await this.startHttpServer(httpServer);
    } catch (err) {
      this.log.log('error', 'GigService startServer() error method: ', err);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      this.log.info(`Gig server has started with process id of ${process.pid} on. gig server has started`);
      httpServer.listen(SERVER_PORT, () => {
        this.log.info(`Gig server running on port ${SERVER_PORT}`);
      });
    } catch (err) {
      this.log.log('error', 'GigService startHttpServer() error method: ', err);
    }
  }
}
