import dotenv from 'dotenv';
import { singleton, injectable } from 'tsyringe';

dotenv.config({});

@singleton()
@injectable()
export class EnvConfig {
  public ENABLE_APM: string;
  public GATEWAY_JWT_TOKEN: string;
  public JWT_TOKEN: string;
  public NODE_ENV: string;
  public CLIENT_URL: string;
  public API_GATEWAY_URL: string;
  public RABBITMQ_ENDPOINT: string;
  public MYSQL_DB: string;
  public MYSQL_HOST: string;
  public MYSQL_USER: string;
  public MYSQL_PASSWORD: string;
  public MYSQL_PORT: string;
  public CLOUD_NAME: string;
  public CLOUD_API_KEY: string;
  public CLOUD_API_SECRET: string;
  public ELASTIC_SEARCH_URL: string;
  public ELASTIC_APM_SERVER_URL: string;
  public ELASTIC_APM_SECRET_TOKEN: string;

  constructor() {
    this.ENABLE_APM = process.env.ENABLE_APM || '0';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.MYSQL_DB = process.env.MYSQL_DB || '';
    this.MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
    this.MYSQL_USER = process.env.MYSQL_USER || '';
    this.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
    this.MYSQL_PORT = process.env.MYSQL_PORT || '3306';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || '';
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || '';
  }
}
