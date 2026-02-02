import { EnvConfig } from '@auth/config';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import client, { Channel, ChannelModel } from 'amqplib';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
class QueueConnection {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'authQueueConnection', 'debug');
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly config: EnvConfig) {}

  async connect(): Promise<Channel | undefined> {
    try {
      this.connection = await client.connect(`${this.config.RABBITMQ_ENDPOINT}`);
      this.channel = await this.connection.createChannel();
      this.log.info('AuthService connected to queue successfully');
      this.handleCloseOnSigint();
      return this.channel;
    } catch (error) {
      this.log.log('error', 'AuthService QueueConnection.connect() method: ', error);
      return undefined;
    }
  }

  private handleCloseOnSigint(): void {
    process.once('SIGINT', async () => {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    });
  }
}

export { QueueConnection };
