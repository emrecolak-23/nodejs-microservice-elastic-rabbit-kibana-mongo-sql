import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@order/config';
import { OrderServer } from '@order/server';
import { Database } from '@order/loaders';
import { NotificationModel } from '@order/models/notification.schema';
import { OrderModel } from '@order/models/order.schema';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);

container.register('NotificationModel', { useValue: NotificationModel });
container.register('OrderModel', { useValue: OrderModel });

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
