import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@auth/config';
import { Channel } from 'amqplib';
import { QueueConnection } from './connection';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
class AuthProducer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection
  ) {}

  async publishDirectMessage(
    channel: Channel,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
  ): Promise<void> {
    try {
      if (!channel) {
        channel = (await this.queueConnection.connect()) as Channel;
      }

      await channel.assertExchange(exchangeName, 'direct', { durable: true });
      channel.publish(exchangeName, routingKey, Buffer.from(message));
      this.log.info(logMessage);
    } catch (error) {
      this.log.log('error', 'AuthProducer publishDirectMessage() method error: ', error);
    }
  }
}

export { AuthProducer };
