import { EnvConfig } from '@order/config';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import client, { Channel, ChannelModel } from 'amqplib';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class QueueConnection {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'orderQueueConnection', 'debug');
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnecting: boolean = false;
  private isSigintHandlerSet: boolean = false;

  private readonly RETRY_DELAY = 5000;
  private readonly MAX_RETRIES = 10;

  constructor(private readonly config: EnvConfig) {}

  async connect(): Promise<Channel> {
    if (this.channel && this.connection) {
      return this.channel;
    }

    if (this.isConnecting) {
      await this.waitForConnection();
      return this.channel!;
    }

    this.isConnecting = true;

    try {
      this.connection = await this.createConnection();
      this.channel = await this.connection.createChannel();

      this.setupEventHandlers();
      this.handleCloseOnSigint();

      this.log.info('OrderService connected to queue successfully');
      return this.channel;
    } catch (error) {
      this.log.log('error', 'OrderService QueueConnection.connect() method error:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async createConnection(retryCount: number = 0): Promise<ChannelModel> {
    try {
      return await client.connect(this.config.RABBITMQ_ENDPOINT);
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        this.log.warn(`RabbitMQ connection failed, retrying in ${this.RETRY_DELAY}ms... (${retryCount + 1}/${this.MAX_RETRIES})`);
        await this.delay(this.RETRY_DELAY);
        return this.createConnection(retryCount + 1);
      }
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('close', async (err) => {
      this.log.warn('RabbitMQ connection closed', err);
      this.channel = null;
      this.connection = null;

      await this.reconnect();
    });

    this.connection.on('error', (err) => {
      this.log.error('RabbitMQ connection error:', err);
    });

    this.connection.on('blocked', (reason) => {
      this.log.warn('RabbitMQ connection blocked:', reason);
    });

    this.connection.on('unblocked', () => {
      this.log.info('RabbitMQ connection unblocked');
    });

    if (this.channel) {
      this.channel.on('error', (err) => {
        this.log.error('RabbitMQ channel error:', err);
      });

      this.channel.on('close', () => {
        this.log.warn('RabbitMQ channel closed');
      });
    }
  }

  private async reconnect(): Promise<void> {
    this.log.info('Attempting to reconnect to RabbitMQ...');

    try {
      await this.connect();
      this.log.info('Reconnected to RabbitMQ successfully');
    } catch (error) {
      this.log.error('Failed to reconnect to RabbitMQ:', error);
    }
  }

  private async waitForConnection(): Promise<void> {
    while (this.isConnecting) {
      await this.delay(100);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleCloseOnSigint(): void {
    if (this.isSigintHandlerSet) return;

    process.once('SIGINT', async () => {
      this.log.info('Closing RabbitMQ connection...');
      try {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        this.log.info('RabbitMQ connection closed gracefully');
      } catch (error) {
        this.log.error('Error closing RabbitMQ connection:', error);
      }
    });

    this.isSigintHandlerSet = true;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  getChannel(): Channel | null {
    return this.channel;
  }
}
