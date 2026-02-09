import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@chat/config';
import { ChatServer } from '@chat/server';
import { Database } from '@chat/loaders';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);
class Application {
  constructor(private readonly chatServer: ChatServer) {}
  public async initialize(): Promise<void> {
    envConfig.cloudinaryConfig();
    const app: Express = express();
    database.databaseConnection();
    this.chatServer.start(app);
  }
}

const chatServer = container.resolve(ChatServer);
const application: Application = new Application(chatServer);
application.initialize();
