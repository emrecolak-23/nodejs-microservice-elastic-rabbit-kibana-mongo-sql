import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { Application } from 'express';
import http from 'http';
import { healthRoutes } from '@notifications/route';
import { checkConnection } from '@notifications/elasticsearch';
import createConnection from '@notifications/queues/connection';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  // http://localhost:4001/notification-health
  app.use('', healthRoutes);
  startsQueues();
  startElasticSearch();
}

async function startsQueues(): Promise<void> {
  await createConnection();
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log(`error`, 'NotificationService startServer() method: ', error);
  }
}
