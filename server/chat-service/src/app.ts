import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { EnvConfig } from '@chat/config';
import { ChatServer } from '@chat/server';
import { Database } from '@chat/loaders';
import { ConversationModel, MessageModel } from '@chat/models';

const envConfig = container.resolve(EnvConfig);
const database = container.resolve(Database);

container.register('ConversationModel', { useValue: ConversationModel });
container.register('MessageModel', { useValue: MessageModel });
class Application {
  constructor(private readonly chatServer: ChatServer) {}
  public async initialize(): Promise<void> {
    envConfig.cloudinaryConfig();
    await database.databaseConnection();
    const app: Express = express();
    this.chatServer.start(app);
  }
}

const chatServer = container.resolve(ChatServer);
const application: Application = new Application(chatServer);
application.initialize();
