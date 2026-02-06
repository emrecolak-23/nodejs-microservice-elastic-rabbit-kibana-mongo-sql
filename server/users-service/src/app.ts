import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@users/config';
import { Database } from '@users/loaders';
import { UsersServer } from './server';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);
class Application {
  constructor(private readonly usersServer: UsersServer) {}
  public initialize(): void {
    envConfig.cloudinaryConfig();
    database.databaseConnection();
    const app: Express = express();
    this.usersServer.start(app);
  }
}

const usersServer = container.resolve(UsersServer);
const application: Application = new Application(usersServer);
application.initialize();
