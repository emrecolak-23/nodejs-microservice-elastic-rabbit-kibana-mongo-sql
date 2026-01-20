import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import express, { Application } from 'express';
import { start } from '@notifications/server';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug');

function initializeApp(): void {
  const app: Application = express();
  start(app);
  log.info('Notification Service Initialized');
}

initializeApp();
