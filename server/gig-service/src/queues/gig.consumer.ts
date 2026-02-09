import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { IReviewMessageDetails, winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';
import { QueueConnection } from '@gig/queues/connection';
import { GigService } from '@gig/services/gig.service';
import { IdempotencyService } from '@gig/services/idempotency.service';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { QueueConfig, SEED_GIG_QUEUE_CONFIG, UPDATE_GIG_QUEUE_CONFIG, RETRY_CONFIG } from '@gig/queues/types/consumer.type';

@injectable()
@singleton()
export class GigConsumer {
  private readonly log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'gigConsumer', 'debug');

  constructor(
    private readonly queueConnection: QueueConnection,
    private readonly config: EnvConfig,
    private readonly gigService: GigService,
    private readonly idempotencyService: IdempotencyService
  ) {}

  private async ensureChannel(channel: Channel | null): Promise<Channel> {
    if (!channel) {
      channel = (await this.queueConnection.connect()) as Channel;
    }
    return channel;
  }

  private async setupQueue(channel: Channel, config: QueueConfig): Promise<Replies.AssertQueue> {
    await channel.assertExchange(config.dlq.exchangeName, 'direct', { durable: true });

    await channel.assertQueue(config.dlq.queueName, {
      durable: true,
      autoDelete: false
    });

    await channel.bindQueue(config.dlq.queueName, config.dlq.exchangeName, config.dlq.routingKey);

    await channel.assertExchange(config.exchangeName, 'direct', { durable: true });

    const queue: Replies.AssertQueue = await channel.assertQueue(config.queueName, {
      durable: true,
      autoDelete: false,
      arguments: {
        'x-dead-letter-exchange': config.dlq.exchangeName,
        'x-dead-letter-routing-key': config.dlq.routingKey
      }
    });

    await channel.bindQueue(queue.queue, config.exchangeName, config.routingKey);

    this.log.info(`Queue setup: ${config.queueName} with DLQ: ${config.dlq.queueName}`);
    return queue;
  }

  private getMessageId(msg: ConsumeMessage): string {
    return msg.properties.messageId || Buffer.from(msg.content).toString('base64').slice(0, 32);
  }

  private getRetryCount(msg: ConsumeMessage): number {
    return msg.properties.headers?.['x-retry-count'] || 0;
  }

  private async retry(channel: Channel, msg: ConsumeMessage, config: QueueConfig): Promise<void> {
    const retryCount = this.getRetryCount(msg);
    const delay = RETRY_CONFIG.delayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);

    this.log.warn(`Retry ${retryCount + 1}/${RETRY_CONFIG.maxRetries} for message ${this.getMessageId(msg)} in ${delay}ms`);

    await this.delay(delay);

    channel.publish(config.exchangeName, config.routingKey, msg.content, {
      ...msg.properties,
      headers: {
        ...msg.properties.headers,
        'x-retry-count': retryCount + 1
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async consumeGigDirectMessage(channel: Channel) {
    try {
      channel = await this.ensureChannel(channel);
      const queue = await this.setupQueue(channel, UPDATE_GIG_QUEUE_CONFIG);

      channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        const messageId = this.getMessageId(msg);
        const retryCount = this.getRetryCount(msg);

        try {
          if (await this.idempotencyService.isProcessed(messageId)) {
            this.log.debug(`Duplicate message skipped: ${messageId}`);
            channel.ack(msg);
            return;
          }

          const { gigReview } = JSON.parse(msg.content.toString());
          await this.gigService.updateGigReview(JSON.parse(gigReview) as IReviewMessageDetails);

          await this.idempotencyService.markAsProcessed(messageId);
          channel.ack(msg);
          this.log.info(`Message processed: ${messageId}`);
        } catch (error) {
          this.log.error(`Error processing message ${messageId}:`, error);

          if (retryCount < RETRY_CONFIG.maxRetries) {
            await this.retry(channel, msg, UPDATE_GIG_QUEUE_CONFIG);
            channel.ack(msg);
          } else {
            channel.nack(msg, false, false);
            this.log.error(`Message sent to DLQ after ${retryCount} retries: ${messageId}`);
          }
        }
      });

      this.log.info('GigConsumer consumeGigDirectMessage started');
    } catch (error) {
      this.log.error('GigConsumer consumeGigDirectMessage() setup error:', error);
    }
  }

  async consumeSeedDirectMessage(channel: Channel) {
    try {
      channel = await this.ensureChannel(channel);
      const queue = await this.setupQueue(channel, SEED_GIG_QUEUE_CONFIG);

      channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        const messageId = this.getMessageId(msg);
        const retryCount = this.getRetryCount(msg);

        try {
          if (await this.idempotencyService.isProcessed(messageId)) {
            this.log.debug(`Duplicate message skipped: ${messageId}`);
            channel.ack(msg);
            return;
          }

          const { sellers, count } = JSON.parse(msg.content.toString());
          await this.gigService.seedData(sellers, count);

          await this.idempotencyService.markAsProcessed(messageId);
          channel.ack(msg);
          this.log.info(`Seed message processed: ${messageId}`);
        } catch (error) {
          this.log.error(`Error processing seed message ${messageId}:`, error);

          if (retryCount < RETRY_CONFIG.maxRetries) {
            await this.retry(channel, msg, SEED_GIG_QUEUE_CONFIG);
            channel.ack(msg);
          } else {
            channel.nack(msg, false, false);
            this.log.error(`Seed message sent to DLQ after ${retryCount} retries: ${messageId}`);
          }
        }
      });

      this.log.info('GigConsumer consumeSeedDirectMessage started');
    } catch (error) {
      this.log.error('GigConsumer consumeSeedDirectMessage() setup error:', error);
    }
  }
}
