import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@users/config';
import { QueueConnection } from '@users/queues/connection';
import {
  BUYER_QUEUE_CONFIG,
  SELLER_QUEUE_CONFIG,
  REVIEW_QUEUE_CONFIG,
  SEED_GIG_QUEUE_CONFIG,
  BuyerMessage,
  SellerMessage,
  ReviewMessage,
  GigMessage
} from '@users/queues/types/consumer.types';
import {
  IBuyerMessageStrategy,
  BuyerAuthStrategy,
  BuyerUpdateStrategy,
  ISellerMessageStrategy,
  SellerCreateOrderStrategy,
  SellerApproveOrderStrategy,
  SellerUpdateGigCountStrategy,
  SellerCancelOrderStrategy,
  IReviewMessageStrategy,
  ReviewCreateStrategy,
  IGigMessageStrategy,
  GigGetSellersStrategy
} from '@users/queues/strategies';

@injectable()
@singleton()
export class UserConsumer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'usersServiceConsumer', 'debug');
  private readonly buyerStrategies: Map<string, IBuyerMessageStrategy>;
  private readonly sellerStrategies: Map<string, ISellerMessageStrategy>;
  private readonly reviewStrategies: Map<string, IReviewMessageStrategy>;
  private readonly gigStrategies: Map<string, IGigMessageStrategy>;

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection,
    private readonly buyerAuthStrategy: BuyerAuthStrategy,
    private readonly buyerUpdateStrategy: BuyerUpdateStrategy,
    private readonly sellerCreateOrderStrategy: SellerCreateOrderStrategy,
    private readonly sellerApproveOrderStrategy: SellerApproveOrderStrategy,
    private readonly sellerUpdateGigCountStrategy: SellerUpdateGigCountStrategy,
    private readonly sellerCancelOrderStrategy: SellerCancelOrderStrategy,
    private readonly reviewCreateStrategy: ReviewCreateStrategy,
    private readonly gigGetSellersStrategy: GigGetSellersStrategy
  ) {
    this.buyerStrategies = new Map<string, IBuyerMessageStrategy>();
    this.buyerStrategies.set(this.buyerAuthStrategy.getType(), this.buyerAuthStrategy);
    this.buyerStrategies.set(this.buyerUpdateStrategy.getType(), this.buyerUpdateStrategy);

    this.sellerStrategies = new Map<string, ISellerMessageStrategy>();
    this.sellerStrategies.set(this.sellerCreateOrderStrategy.getType(), this.sellerCreateOrderStrategy);
    this.sellerStrategies.set(this.sellerApproveOrderStrategy.getType(), this.sellerApproveOrderStrategy);
    this.sellerStrategies.set(this.sellerUpdateGigCountStrategy.getType(), this.sellerUpdateGigCountStrategy);
    this.sellerStrategies.set(this.sellerCancelOrderStrategy.getType(), this.sellerCancelOrderStrategy);

    this.reviewStrategies = new Map<string, IReviewMessageStrategy>();
    this.reviewStrategies.set(this.reviewCreateStrategy.getType(), this.reviewCreateStrategy);

    this.gigStrategies = new Map<string, IGigMessageStrategy>();
    this.gigStrategies.set(this.gigGetSellersStrategy.getType(), this.gigGetSellersStrategy);
  }

  async consumeBuyerDirectMessage(channel: Channel): Promise<void> {
    try {
      channel = await this.ensureChannel(channel);
      await this.setupQueue(channel, BUYER_QUEUE_CONFIG);

      channel.consume(BUYER_QUEUE_CONFIG.queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const message = this.parseMessage<BuyerMessage>(msg);
          await this.handleBuyerMessage(message);
          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'UserConsumer handleBuyerMessage() error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'UserConsumer consumeBuyerDirectMessage() method error: ', error);
    }
  }

  async consumeSellerDirectMessage(channel: Channel): Promise<void> {
    try {
      channel = await this.ensureChannel(channel);
      await this.setupQueue(channel, SELLER_QUEUE_CONFIG);

      channel.consume(SELLER_QUEUE_CONFIG.queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const message = this.parseMessage<SellerMessage>(msg);
          await this.handleSellerMessage(message);
          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'UserConsumer handleSellerMessage() error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'UserConsumer consumeSellerDirectMessage() method error: ', error);
    }
  }

  async consumeReviewFanoutMessage(channel: Channel): Promise<void> {
    try {
      channel = await this.ensureChannel(channel);
      await this.setupFanoutQueue(channel, REVIEW_QUEUE_CONFIG);

      channel.consume(REVIEW_QUEUE_CONFIG.queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const message = this.parseMessage<ReviewMessage>(msg);
          await this.handleReviewMessage(message, channel);
          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'UserConsumer handleReviewMessage() error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'UserConsumer consumeReviewFanoutMessage() method error: ', error);
    }
  }

  async consumeSeedGigDirectMessage(channel: Channel): Promise<void> {
    try {
      channel = await this.ensureChannel(channel);
      await this.setupQueue(channel, SEED_GIG_QUEUE_CONFIG);
      channel.consume(SEED_GIG_QUEUE_CONFIG.queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const message = this.parseMessage<GigMessage>(msg);
          await this.handleGigMessage(message, channel);
          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'UserConsumer handleSeedGigMessage() error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'UserConsumer consumeSeedGigDirectMessage() method error: ', error);
    }
  }

  private async ensureChannel(channel: Channel | null): Promise<Channel> {
    if (!channel) {
      return this.queueConnection.getChannel();
    }
    return channel;
  }

  private async setupQueue(channel: Channel, config: { exchangeName: string; routingKey: string; queueName: string }): Promise<void> {
    await channel.assertExchange(config.exchangeName, 'direct', { durable: true });
    const queue: Replies.AssertQueue = await channel.assertQueue(config.queueName, {
      durable: true,
      autoDelete: false
    });
    await channel.bindQueue(queue.queue, config.exchangeName, config.routingKey);
  }

  private async setupFanoutQueue(channel: Channel, config: { exchangeName: string; queueName: string }): Promise<void> {
    await channel.assertExchange(config.exchangeName, 'fanout', { durable: true });
    const queue: Replies.AssertQueue = await channel.assertQueue(config.queueName, {
      durable: true,
      autoDelete: false
    });
    await channel.bindQueue(queue.queue, config.exchangeName, '');
  }

  private parseMessage<T>(msg: ConsumeMessage): T {
    try {
      const content = msg.content.toString();
      return JSON.parse(content) as T;
    } catch (error) {
      this.log.log('error', 'Failed to parse message content: ', error);
      throw new Error('Invalid message format');
    }
  }

  private async handleBuyerMessage(message: BuyerMessage): Promise<void> {
    const strategy = this.buyerStrategies.get(message.type);
    if (!strategy) {
      this.log.log('warn', `Unknown buyer message type: ${message.type}`);
      return;
    }
    await strategy.handle(message);
  }

  private async handleReviewMessage(message: ReviewMessage, channel: Channel): Promise<void> {
    const strategy = this.reviewStrategies.get(message.type);
    if (!strategy) {
      this.log.log('warn', `Unknown review message type: ${message.type}`);
      return;
    }
    await strategy.handle(message, channel);
  }

  private async handleGigMessage(message: GigMessage, channel: Channel): Promise<void> {
    const strategy = this.gigStrategies.get(message.type);
    if (!strategy) {
      this.log.log('warn', `Unknown gig message type: ${message.type}`);
      return;
    }
    await strategy.handle(message, channel);
  }

  private async handleSellerMessage(message: SellerMessage): Promise<void> {
    const messageType = message.type;
    if (!messageType) {
      this.log.log('warn', 'Received seller message without a type');
      return;
    }
    const strategy = this.sellerStrategies.get(messageType);
    if (!strategy) {
      this.log.log('warn', `Unknown seller message type: ${messageType}`);
      return;
    }
    await strategy.handle(message);
  }
}
