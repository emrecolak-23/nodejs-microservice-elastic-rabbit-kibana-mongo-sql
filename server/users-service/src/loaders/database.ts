import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@users/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import mongoose from 'mongoose';

@singleton()
@injectable()
export class Database {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'usersServiceDatabaseConnection', 'debug');

  constructor(private readonly config: EnvConfig) {}

  public async databaseConnection(): Promise<void> {
    try {
      await mongoose.connect(this.config.DATABASE_URL);
      this.log.info('UsersService connected to database successfully');
    } catch (error) {
      this.log.log('error', 'UsersService databaseConnection() method error: ', error);
    }
  }
}
