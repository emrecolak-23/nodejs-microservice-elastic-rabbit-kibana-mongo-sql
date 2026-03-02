import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@gig/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import mongoose from 'mongoose';

@singleton()
@injectable()
export class Database {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceDatabaseConnection', 'debug');

  constructor(private readonly config: EnvConfig) {}

  public async databaseConnection(): Promise<void> {
    const maxRetries = 10;
    const retryDelayMs = 10000;
    const initialDelayMs = 10000;

    mongoose.set('bufferTimeoutMS', 30000);

    this.log.info(`Waiting ${initialDelayMs / 1000}s for pod network to be ready...`);
    await new Promise((resolve) => setTimeout(resolve, initialDelayMs));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await mongoose.connect(this.config.DATABASE_URL, {
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 60000,
          connectTimeoutMS: 60000,
          socketTimeoutMS: 45000,
          directConnection: true // Standalone MongoDB için discovery atlanır
        });
        this.log.info('GigService connected to database successfully');
        return;
      } catch (error) {
        this.log.log('error', `GigService databaseConnection() attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        this.log.info(`Retrying in ${retryDelayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
}
