import { singleton, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Sequelize } from 'sequelize';
import { EnvConfig } from '@auth/config';

@injectable()
@singleton()
export class Database {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'authServiceDatabaseServer', 'debug');

  private sequelize: Sequelize;

  constructor(private readonly config: EnvConfig) {
    this.sequelize = new Sequelize(this.config.MYSQL_DB, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        multipleStatements: true
      }
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      this.log.info('AuthService MySQL Database connection has been established');
    } catch (error) {
      this.log.error('Auth Service - Unable to connect to database');
      this.log.log('error', 'AuthService databaseConnection() method error: ', error);
    }
  }
}
