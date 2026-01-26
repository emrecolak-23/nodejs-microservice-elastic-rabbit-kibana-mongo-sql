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
import { EnvConfig } from '@auth/config';
import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@auth/loaders';
import { verify } from 'jsonwebtoken';

const SERVER_PORT = 4002;

@singleton()
@injectable()
export class AuthServer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiAuthServer', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly elasticSearch: ElasticSearch
  ) {}

  public start(app: Application): void {
    this.securityMiddleware(app);
    this.standartMiddleware(app);
    this.routesMiddleware(app);
    this.startQueues();
    this.startsElasticSearch;
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
    // 'Bearer ' + token
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

  private routesMiddleware(_app: Application): void {}

  private startQueues(): void {
    console.log('Starting Auth Service Queues...');
  }

  private startsElasticSearch(): void {
    this.elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.log.log('error', `${fullUrl} endpoint does not exists`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: `The endpoint called does not exist` });
      next();
    });

    app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      this.log.log('error', `AuthService ${err.comingFrom}: `, err);

      if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ message: err.serializeError().message });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: `The endpoint called does not exist` });
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      await this.startHttpServer(httpServer);
    } catch (err) {
      this.log.log('error', 'AuthService startServer() error method: ', err);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      this.log.info(`Auth server has started with process id of ${process.pid} on. auth server has started`);
      httpServer.listen(SERVER_PORT, () => {
        this.log.info(`Auth server running on port ${SERVER_PORT}`);
      });
    } catch (err) {
      this.log.log('error', 'AuthService startHttpServer() error method: ', err);
    }
  }
}
