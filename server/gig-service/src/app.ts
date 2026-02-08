import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@gig/config';
import { Database } from '@gig/loaders';
import { GigServer } from '@gig/server';
import { GigModel } from './models/gig.schema';
import { Redis } from '@gig/loaders/redis';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);
const redis = container.resolve(Redis);

container.register('GigModel', { useValue: GigModel });

class Application {
  constructor(private readonly gigServer: GigServer) {}
  public async initialize(): Promise<void> {
    envConfig.cloudinaryConfig();
    database.databaseConnection();
    await redis.connect();
    const app: Express = express();
    this.gigServer.start(app);
  }
}

const gigServer = container.resolve(GigServer);
const application: Application = new Application(gigServer);
application.initialize();
