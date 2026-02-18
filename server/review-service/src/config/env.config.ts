import dotenv from 'dotenv';
import { singleton, injectable } from 'tsyringe';

dotenv.config({});

if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('elastic-apm-node').start({
    serviceName: 'jobber-review',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || '',
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || '',
    environment: process.env.NODE_ENV || 'development',
    active: true,
    logLevel: 'trace',
    captureBody: 'all',
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: true
  });
}

@singleton()
@injectable()
export class EnvConfig {
  public ENABLE_APM: string;
  public GATEWAY_JWT_TOKEN: string;
  public DATABASE_HOST: string;
  public DATABASE_USER: string;
  public DATABASE_PASSWORD: string;
  public DATABASE_PORT: string;
  public DATABASE_NAME: string;
  public JWT_TOKEN: string;
  public NODE_ENV: string;
  public CLIENT_URL: string;
  public REDIS_HOST: string;
  public API_GATEWAY_URL: string;
  public RABBITMQ_ENDPOINT: string;
  public DATABASE_URL: string;

  public ELASTIC_SEARCH_URL: string;
  public ELASTIC_APM_SERVER_URL: string;
  public ELASTIC_APM_SECRET_TOKEN: string;

  constructor() {
    this.ENABLE_APM = process.env.ENABLE_APM || '0';
    this.DATABASE_HOST = process.env.DATABASE_HOST || '';
    this.DATABASE_PORT = process.env.DATABASE_PORT || '';
    this.DATABASE_USER = process.env.DATABASE_USER || '';
    this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';
    this.DATABASE_NAME = process.env.DATABASE_NAME || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.DATABASE_URL = process.env.DATABASE_URL || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || '';
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || '';
  }
}
