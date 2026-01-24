import { winstonLogger } from '@emrecolak-23/jobber-share';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import StatusCodes from 'http-status-codes';
import http from 'http';
import { CustomError, IErrorResponse } from '@emrecolak-23/jobber-share';

const SERVER_PORT = process.env.SERVER_PORT || 4000;
const log: Logger = winstonLogger('http://localhost:9200', 'apiGatewayServer', 'debug');

export class GatewayServer {
  constructor(private readonly app: Application) {}

  public start(): void {
    this.securityMiddleware(this.app);
    this.standartMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startsElasticSearch();
    this.errorHandler();
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [],
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false // Set to true if using HTTPS update with value from config
        // sameSite: 'none'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: '',
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standartMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '200mb' }));
    app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(_app: Application): void {}

  private startsElasticSearch(): void {}

  private errorHandler(): void {
    this.app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exists`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: `The endpoint called does not exist` });
      next();
    });

    this.app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.log('error', `GatewayService ${err.comingFrom}: `, err);

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
      log.log('error', 'GatewayService startServer() error method: ', err);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Geteay server has started with process id of ${process.pid} on. gateway server has started`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (err) {
      log.log('error', 'GatewayService startHttpServer() error method: ', err);
    }
  }
}
