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
import { EnvConfig } from '@gateway/configs';
import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@gateway/loaders';
import { appRoutes } from '@gateway/routes';
import { axiosAuthInstance } from '@gateway/services/api/auth.service';
import { axiosBuyerInstance } from '@gateway/services/api/buyer.service';
import { axiosSellerInstance } from '@gateway/services/api/seller.service';
import { axiosGigInstance } from '@gateway/services/api/gig.service';
import { Server } from 'socket.io';
import { createClient, RedisClientType } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/sockets/socket';
import { axiosMessageInstance } from './services/api/message.service';
import { axiosOrderInstance } from './services/api/order.service';
import { axiosReviewInstance } from './services/api/review.service';
import { isAxiosError } from 'axios';

const SERVER_PORT = 4000;
const DEFAULT_ERROR_CODE = StatusCodes.BAD_REQUEST;
const DEFAULT_ERROR_MESSAGE = 'Error occured';
export let socketIO: Server;

@singleton()
@injectable()
export class GatewayServer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly elasticSearch: ElasticSearch
  ) {}

  public start(app: Application): void {
    this.securityMiddleware(app);
    this.standartMiddleware(app);
    this.routesMiddleware(app);
    this.startsElasticSearch();
    this.errorHandler(app);
    this.startServer(app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${this.config.SECRET_KEY_ONE}`, `${this.config.SECRET_KEY_TWO}`],
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: this.config.NODE_ENV !== 'development',
        // Set to true if using HTTPS update with value from config
        ...(this.config.NODE_ENV !== 'development' && { sameSite: 'none' })
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: `${this.config.CLIENT_URL}`,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
      })
    );

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosMessageInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosOrderInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosReviewInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
      }

      next();
    });
  }

  private standartMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '200mb' }));
    app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startsElasticSearch(): void {
    this.elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      this.log.log('error', `${fullUrl} endpoint does not exists`, '');
      res.status(StatusCodes.NOT_FOUND).json({
        message: `The endpoint called does not exist`,
        statusCode: StatusCodes.NOT_FOUND,
        status: 'error',
        comingFrom: 'GatewayService route handler'
      });
      next();
    });

    app.use((err: IErrorResponse | Error, _req: Request, res: Response, next: NextFunction) => {
      if (err instanceof SyntaxError && 'body' in err) {
        this.log.log('error', `GatewayService JSON parse error: ${err.message}`, err);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid JSON format',
          statusCode: StatusCodes.BAD_REQUEST,
          status: 'error',
          comingFrom: 'GatewayService JSON parser'
        });
      }

      if (err instanceof CustomError) {
        this.log.log('error', `GatewayService ${err.comingFrom}: `, err);
        return res.status(err.statusCode).json(err.serializeError());
      }

      if (isAxiosError(err)) {
        this.log.log('error', `GatewayService Axios error - ${err.response?.data.comingFrom}:`, err);
        return res.status(err.response?.data.statusCode ?? DEFAULT_ERROR_CODE).json({
          message: err.response?.data.message ?? DEFAULT_ERROR_MESSAGE
        });
      }

      this.log.log('error', `GatewayService ${(err as IErrorResponse).comingFrom || 'Unknown error'}: `, err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: 'error',
        comingFrom: 'GatewayService errorHandler'
      });
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      await this.startHttpServer(httpServer);
      this.socketIOConnection(socketIO);
    } catch (err) {
      this.log.log('error', 'GatewayService startServer() error method: ', err);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: `${this.config.CLIENT_URL}`,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
      },
      pingTimeout: 5000,
      pingInterval: 2000
    });
    const pubClient: RedisClientType = createClient({
      url: this.config.REDIS_HOST,
      socket: {
        connectTimeout: 30000
      }
    });

    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    socketIO = io;
    return io;
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      this.log.info(`Geteay server has started with process id of ${process.pid} on. gateway server has started`);
      httpServer.listen(SERVER_PORT, () => {
        this.log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (err) {
      this.log.log('error', 'GatewayService startHttpServer() error method: ', err);
    }
  }

  private async socketIOConnection(io: Server): Promise<void> {
    try {
      const socketIOApp = new SocketIOAppHandler(io);
      await socketIOApp.listen();
    } catch (err) {
      this.log.log('error', 'GatewayService socketIOConnection() error method: ', err);
    }
  }
}
