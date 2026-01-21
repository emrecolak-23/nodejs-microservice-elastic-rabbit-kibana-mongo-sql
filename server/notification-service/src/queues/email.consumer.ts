import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import createConnection from './connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

async function setupEmailConsumer(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  queueName: string,
  handler: (msg: ConsumeMessage) => Promise<void>
): Promise<void> {
  if (!channel) {
    channel = (await createConnection()) as Channel;
  }

  await channel.assertExchange(exchangeName, 'direct', { durable: true });
  const q = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
  await channel.bindQueue(q.queue, exchangeName, routingKey);

  channel.consume(q.queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    try {
      await handler(msg);
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, true);
    }
  });
}

export async function consumeAuthEmailMessages(channel: Channel): Promise<void> {
  await setupEmailConsumer(channel, 'jobber-email-notification', 'auth-email', 'auth-email-queue', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(JSON.parse(msg.content.toString()));
    log.info('info ', `Auth Email Data: ${JSON.stringify(data)}`);
  });
}

export async function consumeOrderEmailMessages(channel: Channel): Promise<void> {
  await setupEmailConsumer(channel, 'jobber-order-notification', 'order-email', 'order-email-queue', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(JSON.parse(msg.content.toString()));
    log.log('info', `Order Email Data: ${JSON.stringify(data)}`);
  });
}
