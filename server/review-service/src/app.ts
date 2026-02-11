import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { ReviewServer } from './server';
import { Database } from '@review/loaders';

const database = container.resolve(Database);

class Application {
  constructor(private readonly reviewServer: ReviewServer) {}
  public async initialize(): Promise<void> {
    const app: Express = express();
    await database.connect();
    this.reviewServer.start(app);
  }
}

const reviewServer = container.resolve(ReviewServer);
const application: Application = new Application(reviewServer);
application.initialize();
