import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@order/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import mongoose from 'mongoose';

@singleton()
@injectable()
export class Database {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'orderServiceDatabaseConnection', 'debug');

  constructor(private readonly config: EnvConfig) {}

  public async databaseConnection(): Promise<void> {
    try {
      await mongoose.connect(this.config.DATABASE_URL);
      this.log.info('OrderService connected to database successfully');
    } catch (error) {
      this.log.log('error', 'OrderService databaseConnection() method error: ', error);
    }
  }
}
