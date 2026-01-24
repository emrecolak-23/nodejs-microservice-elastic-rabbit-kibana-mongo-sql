import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Application } from 'express';
import { Logger } from 'winston';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';

const SERVER_PORT = process.env.SERVER_PORT || 4000;
const log: Logger = winstonLogger('', 'apiGatewayServer', 'debug');

export class GatewayServer {
  constructor(private readonly app: Application) {}

  public start(): void {}

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
}
