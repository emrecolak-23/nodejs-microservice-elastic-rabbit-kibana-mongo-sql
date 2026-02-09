import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@chat/config';
import { Channel } from 'amqplib';
import { QueueConnection } from './connection';
import { injectable, singleton } from 'tsyringe';

interface PublishOptions {
  exchangeName: string;
  routingKey: string;
  message: string;
  logMessage: string;
}

@injectable()
@singleton()
export class ChatProducer {
  private log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'chatServiceProducer', 'debug');
  private channel: Channel | null = null;
  private initializedExchanges: Set<string> = new Set();
  private isChannelEventsSetup: boolean = false;

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection
  ) {}

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = (await this.queueConnection.connect()) as Channel;
      this.setupChannelEvents();
    }
    return this.channel;
  }

  private setupChannelEvents(): void {
    if (!this.channel || this.isChannelEventsSetup) return;

    this.channel.on('error', (err) => {
      this.log.error('Channel error:', err);
      this.channel = null;
      this.isChannelEventsSetup = false;
    });

    this.channel.on('close', () => {
      this.log.warn('Channel closed');
      this.channel = null;
      this.initializedExchanges.clear();
      this.isChannelEventsSetup = false;
    });

    this.isChannelEventsSetup = true;
  }

  private async ensureExchange(channel: Channel, exchangeName: string): Promise<void> {
    if (this.initializedExchanges.has(exchangeName)) {
      return;
    }

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    this.initializedExchanges.add(exchangeName);
  }

  async publishDirectMessage(options: PublishOptions): Promise<boolean> {
    const { exchangeName, routingKey, message, logMessage } = options;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const channel = await this.getChannel();
        await this.ensureExchange(channel, exchangeName);

        const success = channel.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });

        if (success) {
          this.log.info(logMessage);
          return true;
        }

        await this.waitForDrain(channel);
        this.log.info(logMessage);
        return true;
      } catch (error) {
        this.log.warn(`Publish attempt ${attempt}/${this.MAX_RETRIES} failed:`, error);

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
          this.channel = null;
        } else {
          this.log.error('All publish attempts failed:', error);
          return false;
        }
      }
    }

    return false;
  }

  private waitForDrain(channel: Channel): Promise<void> {
    return new Promise((resolve) => {
      channel.once('drain', resolve);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
