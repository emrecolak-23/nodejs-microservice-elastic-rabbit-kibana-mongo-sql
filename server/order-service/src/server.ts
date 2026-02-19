import http from 'http';

import { IAuthPayload, winstonLogger, CustomError, IErrorResponse } from '@emrecolak-23/jobber-share';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { EnvConfig } from '@order/config';
import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@order/loaders';
import { verify } from 'jsonwebtoken';
import { appRoutes } from '@order/routes';
import { Channel } from 'amqplib';
import { Server } from 'socket.io';

import { QueueConnection } from './queues/connection';
import { OrderConsumer } from './queues/order.consumer';

const SERVER_PORT = 4006;

export let orderChannel: Channel;
export let socketIOOrderObject: Server;

@singleton()
@injectable()
export class OrderServer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiOrderServer', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly elasticSearch: ElasticSearch,
    private readonly queueConnection: QueueConnection,
    private readonly orderConsumer: OrderConsumer
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
  }

  private async startQueues(): Promise<void> {
    orderChannel = await this.queueConnection.getChannel();
    await this.orderConsumer.consumeReviewFanoutMessages(orderChannel);
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private errorHandler(app: Application): void {
    app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.log.log('error', `${fullUrl} endpoint does not exists`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist' });
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
              comingFrom: 'OrderService errorHandler'
            };

      this.log.log('error', `OrderService ${err.comingFrom}: `, errorLog);

      if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.serializeError());
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: 'error',
        comingFrom: 'OrderService errorHandler'
      });
      next();
    });
  }

  async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
      }
    });
    return io;
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      await this.startHttpServer(httpServer);
      socketIOOrderObject = socketIO;
    } catch (err) {
      this.log.log('error', 'OrderService startServer() error method: ', err);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      this.log.info(`Order server has started with process id of ${process.pid} on. order server has started`);
      httpServer.listen(SERVER_PORT, () => {
        this.log.info(`Order server running on port ${SERVER_PORT}`);
      });
    } catch (err) {
      this.log.log('error', 'OrderService startHttpServer() error method: ', err);
    }
  }
}
