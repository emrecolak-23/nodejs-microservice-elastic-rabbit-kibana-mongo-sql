import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@order/config';
import { OrderServer } from '@order/server';
import { Database } from '@order/loaders';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);

class Application {
  constructor(private readonly orderServer: OrderServer) {}
  public async initialize(): Promise<void> {
    envConfig.cloudinaryConfig();
    const app: Express = express();
    database.databaseConnection();
    this.orderServer.start(app);
  }
}

const orderServer = container.resolve(OrderServer);
const application: Application = new Application(orderServer);
application.initialize();
