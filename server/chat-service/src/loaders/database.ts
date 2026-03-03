import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@chat/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import mongoose from 'mongoose';

@singleton()
@injectable()
export class Database {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'chatServiceDatabaseConnection', 'debug');

  constructor(private readonly config: EnvConfig) {}

  public async databaseConnection(): Promise<void> {
    const maxRetries = 15;
    const retryDelayMs = 15000;
    const initialDelayMs = 30000;

    mongoose.set('bufferTimeoutMS', 60000);

    this.log.info(`Waiting ${initialDelayMs / 1000}s for pod network and DNS to be ready...`);
    await new Promise((resolve) => setTimeout(resolve, initialDelayMs));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await mongoose.connect(this.config.DATABASE_URL, {
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 60000,
          connectTimeoutMS: 60000,
          socketTimeoutMS: 45000,
          directConnection: true
        });
        this.log.info('ChatService connected to database successfully');
        return;
      } catch (error) {
        this.log.log('error', `ChatService databaseConnection() attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        this.log.info(`Retrying in ${retryDelayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
}
