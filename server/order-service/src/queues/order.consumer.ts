import { injectable, singleton } from 'tsyringe';
import { OrderService } from '@order/services/order.service';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@order/config';
import { QueueConnection } from '@order/queues/connection';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { QueueConfig, EXCHANGE_TYPE, QUEUE_CONFIG } from './types/consumer.types';
import { IdempotencyService } from '@order/services/idempotency.service';

@injectable()
@singleton()
export class OrderConsumer {
  private readonly log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'orderConsumer', 'debug');
  private channel: Channel | null = null;
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection,
    private readonly orderService: OrderService,
    private readonly idempotencyService: IdempotencyService
  ) {}

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = (await this.queueConnection.connect()) as Channel;
    }
    return this.channel;
  }

  private getMessageId(msg: ConsumeMessage): string {
    return msg.properties.messageId || Buffer.from(msg.content).toString('base64').slice(0, 32);
  }

  private getRetryCount(msg: ConsumeMessage): number {
    return msg.properties.headers?.['x-retry-count'] || 0;
  }

  private async setupDLQ(channel: Channel, config: QueueConfig): Promise<void> {
    if (!config.dlq) return;

    await channel.assertExchange(config.dlq.exchangeName, EXCHANGE_TYPE.FANOUT, { durable: true });
    await channel.assertQueue(config.dlq.queueName, { durable: true });
    await channel.bindQueue(config.dlq.queueName, config.dlq.exchangeName, config.dlq.routingKey);
  }

  private async setupMainQueue(channel: Channel, config: QueueConfig): Promise<Replies.AssertQueue> {
    await channel.assertExchange(config.exchangeName, EXCHANGE_TYPE.FANOUT, { durable: true });

    const queue = await channel.assertQueue(config.queueName, {
      durable: true,
      autoDelete: false,
      arguments: config.dlq
        ? {
            'x-dead-letter-exchange': config.dlq.exchangeName,
            'x-dead-letter-routing-key': config.dlq.routingKey
          }
        : undefined
    });

    await channel.bindQueue(queue.queue, config.exchangeName, '');
    return queue;
  }

  private republishForRetry(channel: Channel, msg: ConsumeMessage, queueName: string, retryCount: number): void {
    channel.sendToQueue(queueName, msg.content, {
      persistent: true,
      messageId: msg.properties.messageId,
      headers: {
        ...msg.properties.headers,
        'x-retry-count': retryCount + 1
      }
    });
  }

  async consumeReviewFanoutMessages(channel: Channel): Promise<void> {
    try {
      if (!channel) {
        channel = await this.getChannel();
      }

      const queueConfig: QueueConfig = QUEUE_CONFIG.ORDER_REVIEW_QUEUE;

      await this.setupDLQ(channel, queueConfig);
      const queue = await this.setupMainQueue(channel, queueConfig);

      channel.prefetch(10);

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

          const message = JSON.parse(msg.content.toString());
          await this.orderService.updateOrderReview(message);
          await this.idempotencyService.markAsProcessed(messageId);

          channel.ack(msg);
          this.log.info(`Message processed: ${messageId}`);
        } catch (error) {
          this.log.error(`Failed (attempt ${retryCount + 1}): ${(error as Error).message}`);

          if (retryCount < this.MAX_RETRIES) {
            this.republishForRetry(channel, msg, queueConfig.queueName, retryCount);
            channel.ack(msg);
          } else {
            channel.nack(msg, false, false);
            this.log.error(`Message ${messageId} sent to DLQ after ${this.MAX_RETRIES} retries`);
          }
        }
      });

      this.log.info('Consumer started');
    } catch (error) {
      this.log.error('Consumer failed to start:', error);
      throw error;
    }
  }
}
