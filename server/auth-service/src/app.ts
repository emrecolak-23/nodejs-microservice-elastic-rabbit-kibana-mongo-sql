import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { AuthServer } from '@auth/server';
import { dbConnection } from '@auth/loaders';
import { EnvConfig } from '@auth/config';

const envConfig = container.resolve(EnvConfig);

class Application {
  constructor(private readonly authServer: AuthServer) {}

  public initialize(): void {
    envConfig.cloudinaryConfig();
    const app: Express = express();
    dbConnection();
    this.authServer.start(app);
  }
}

const authServer = container.resolve(AuthServer);
const application: Application = new Application(authServer);
application.initialize();
