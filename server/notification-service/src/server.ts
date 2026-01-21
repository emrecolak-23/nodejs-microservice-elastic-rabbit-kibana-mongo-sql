import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { Application } from 'express';
import http from 'http';
import { healthRoutes } from '@notifications/route';
import { checkConnection } from '@notifications/elasticsearch';
import createConnection from '@notifications/queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';
import { Channel } from 'amqplib';

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
  const emailChannel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
  await emailChannel.assertExchange('jobber-email-notification', 'direct');
  const message = JSON.stringify({ name: 'jobber', service: 'auth notification service' });
  emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(message));
  await emailChannel.assertExchange('jobber-order-notification', 'direct');
  const message2 = JSON.stringify({ name: 'jobber', service: 'order notification service' });
  emailChannel.publish('jobber-order-notification', 'order-email', Buffer.from(message2));
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
