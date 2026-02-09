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
    try {
      await mongoose.connect(this.config.DATABASE_URL);
      this.log.info('ChatService connected to database successfully');
    } catch (error) {
      this.log.log('error', 'ChatService databaseConnection() method error: ', error);
    }
  }
}
