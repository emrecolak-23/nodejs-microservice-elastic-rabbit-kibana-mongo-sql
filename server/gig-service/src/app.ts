import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@gig/config';
import { Database } from '@gig/loaders';
import { GigServer } from '@gig/server';
import { GigModel } from './models/gig.schema';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);

container.register('GigModel', { useValue: GigModel });

class Application {
  constructor(private readonly gigServer: GigServer) {}
  public initialize(): void {
    envConfig.cloudinaryConfig();
    database.databaseConnection();
    const app: Express = express();
    this.gigServer.start(app);
  }
}

const gigServer = container.resolve(GigServer);
const application: Application = new Application(gigServer);
application.initialize();
