import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@review/config';
import { ConfirmChannel } from 'amqplib';
import { injectable, singleton } from 'tsyringe';
import crypto from 'crypto';
import { QueueConnection } from './connection';

interface PublishOptions {
  exchangeName: string;
  message: string;
  logMessage: string;
  channel: ConfirmChannel | undefined;
}

@injectable()
@singleton()
export class ReviewerProducer {
  private readonly log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'reviewServiceProducer', 'debug');
  private readonly initializedExchanges: Set<string> = new Set();

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly CONFIRM_TIMEOUT = 5000;
  private readonly DRAIN_TIMEOUT = 10000;

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection
  ) {}

  private clearExchanges(): void {
    this.initializedExchanges.clear();
  }

  private async ensureExchange(channel: ConfirmChannel, exchangeName: string): Promise<void> {
    if (this.initializedExchanges.has(exchangeName)) {
      return;
    }

    await channel.assertExchange(exchangeName, 'fanout', { durable: true });
    this.initializedExchanges.add(exchangeName);
  }

  async publishFanoutMessage(options: PublishOptions): Promise<boolean> {
    const { exchangeName, message, logMessage } = options;
    let channel: ConfirmChannel | undefined = options.channel;
    const messageId = crypto.randomUUID();

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        if (!channel) {
          channel = (await this.queueConnection.connect()) as ConfirmChannel;
        }
        await this.ensureExchange(channel, exchangeName);

        await this.publishWithConfirm(channel, exchangeName, message, messageId, attempt);

        this.log.info(logMessage);
        return true;
      } catch (error) {
        this.log.warn(`Publish attempt ${attempt}/${this.MAX_RETRIES} failed:`, error);
        this.clearExchanges();

        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
          await this.delay(delay);
        } else {
          this.log.error(`All attempts failed for messageId: ${messageId}`, error);
          return false;
        }
      }
    }

    return false;
  }

  private async publishWithConfirm(
    channel: ConfirmChannel,
    exchangeName: string,
    message: string,
    messageId: string,
    attempt: number
  ): Promise<void> {
    let confirmTimer: NodeJS.Timeout | undefined;

    const confirmPromise = new Promise<void>((resolve, reject) => {
      confirmTimer = setTimeout(() => reject(new Error(`Confirm timeout after ${this.CONFIRM_TIMEOUT}ms`)), this.CONFIRM_TIMEOUT);

      const bufferNotFull = channel.publish(
        exchangeName,
        '',
        Buffer.from(message),
        {
          persistent: true,
          messageId,
          timestamp: Date.now(),
          headers: { 'x-retry-count': attempt - 1 }
        },
        (err) => {
          clearTimeout(confirmTimer);
          if (err) reject(err);
          else resolve();
        }
      );

      if (!bufferNotFull) {
        this.log.warn('Buffer full, waiting for drain...');
        this.waitForDrain(channel).catch((e) => {
          clearTimeout(confirmTimer);
          reject(e);
        });
      }
    });

    await confirmPromise;
  }

  private async waitForDrain(channel: ConfirmChannel): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Drain timeout after ${this.DRAIN_TIMEOUT}ms`)), this.DRAIN_TIMEOUT);
      channel.once('drain', () => {
        clearTimeout(timer);
        this.log.debug('Buffer drained');
        resolve();
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
