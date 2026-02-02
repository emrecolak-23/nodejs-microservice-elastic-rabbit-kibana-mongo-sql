
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Sequelize } from 'sequelize';
import { EnvConfig } from '@auth/config';


const config = new EnvConfig();
console.log(config.ELASTIC_SEARCH_URL, "elastic search url")
const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceDatabaseServer', 'debug');
export const sequelize = new Sequelize(config.MYSQL_DB, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export const dbConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    log.info('AuthService MySQL Database connection has been established');
  } catch (error) {
    log.error('Auth Service - Unable to connect to database');
    log.log('error', 'AuthService databaseConnection() method error: ', error);
  }
};

