import { config } from '@notifications/config';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import client, { Channel, ChannelModel } from 'amqplib';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: ChannelModel = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    log.info('NotificationService connected to queue successfully');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log(`error`, 'NotificationService createConnection() method: ', error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: ChannelModel): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}

export default createConnection;
