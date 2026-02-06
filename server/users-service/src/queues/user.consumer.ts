import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger, IOrderMessage } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@users/config';
import { QueueConnection } from '@users/queues/connection';
import { IBuyerAttributes } from '@users/models/buyer.schema';
import { BuyerRepository } from '@users/repositories';
import { SellerRepository } from '@users/repositories';
import {
  IBuyerAuthMessage,
  IBuyerUpdateMessage,
  ISellerCreateOrderMessage,
  ISellerUpdateGigCountMessage,
  ISellerCancelOrderMessage,
  BUYER_QUEUE_CONFIG,
  SELLER_QUEUE_CONFIG,
  REVIEW_QUEUE_CONFIG,
  SEED_GIG_QUEUE_CONFIG,
  MESSAGE_TYPES,
  BuyerMessage,
  SellerMessage,
  ReviewMessage,
  GigMessage,
  ISeedGigMessage
} from '@users/queues/types/consumer.types';
import { UserProducer } from './user.producer';
import { ISellerDocument } from '@users/models/seller.schema';

@injectable()
@singleton()
export class UserConsumer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'usersServiceConsumer', 'debug');
  private readonly buyerHandlers: Map<string, (message: BuyerMessage) => Promise<void>>;
  private readonly sellerHandlers: Map<string, (message: SellerMessage) => Promise<void>>;
  private readonly reviewHandlers: Map<string, (message: ReviewMessage, channel: Channel) => Promise<void>>;
  private readonly seedGigHandlers: Map<string, (message: GigMessage, channel: Channel) => Promise<void>>;

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection,
    private readonly buyerRepository: BuyerRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly userProducer: UserProducer
  ) {
    this.buyerHandlers = new Map([
      [MESSAGE_TYPES.BUYER.AUTH, this.handleBuyerAuth.bind(this)],
      [MESSAGE_TYPES.BUYER.UPDATE_PURCHASED_GIGS, this.handleBuyerUpdate.bind(this)]
    ]);

    this.sellerHandlers = new Map([
      [MESSAGE_TYPES.SELLER.CREATE_ORDER, this.handleSellerCreateOrder.bind(this)],
      [MESSAGE_TYPES.SELLER.APPROVE_ORDER, this.handleSellerApproveOrder.bind(this)],
      [MESSAGE_TYPES.SELLER.UPDATE_GIG_COUNT, this.handleSellerUpdateGigCount.bind(this)],
      [MESSAGE_TYPES.SELLER.CANCEL_ORDER, this.handleSellerCancelOrder.bind(this)]
    ]);

    this.reviewHandlers = new Map([[MESSAGE_TYPES.REVIEW.CREATE_REVIEW, this.handleReviewCreate.bind(this)]]);

    this.seedGigHandlers = new Map([[MESSAGE_TYPES.SEED_GIG.GET_SELLERS, this.handleGetSellers.bind(this)]]);
  }

  private async handleBuyerAuth(message: BuyerMessage): Promise<void> {
    const msg = message as IBuyerAuthMessage;
    const buyer: IBuyerAttributes = {
      username: msg.username,
      email: msg.email,
      profilePicture: msg.profilePicture,
      country: msg.country,
      isSeller: false,
      purchasedGigs: []
    };
    await this.buyerRepository.createBuyer(buyer);
  }

  private async handleBuyerUpdate(message: BuyerMessage): Promise<void> {
    const msg = message as IBuyerUpdateMessage;
    await this.buyerRepository.updateBuyerPurchasedGigsProp(msg.buyerId, msg.purchasedGigId, msg.type);
  }

  private async handleSellerCreateOrder(message: SellerMessage): Promise<void> {
    const msg = message as ISellerCreateOrderMessage;
    await this.sellerRepository.incrementSellerNumericField(msg.sellerId, 'ongoingJobs', msg.ongoingJobs);
  }

  private async handleSellerApproveOrder(message: SellerMessage): Promise<void> {
    await this.sellerRepository.updateSellerCompletedJobsCount(message as IOrderMessage);
  }

  private async handleSellerUpdateGigCount(message: SellerMessage): Promise<void> {
    const msg = message as ISellerUpdateGigCountMessage;
    await this.sellerRepository.incrementSellerNumericField(msg.gigSellerId, 'totalGigs', msg.count);
  }

  private async handleSellerCancelOrder(message: SellerMessage): Promise<void> {
    const msg = message as ISellerCancelOrderMessage;
    await this.sellerRepository.updateSellerCancelledJobsCount(msg.sellerId);
  }

  private async handleReviewCreate(message: ReviewMessage, channel: Channel): Promise<void> {
    await this.sellerRepository.updateSellerReview(message);
    await this.userProducer.publishDirectMessage(
      channel,
      'jobber-update-gig',
      'update-gig',
      JSON.stringify({
        type: 'update-gig',
        gigReview: message
      }),
      'Message sent to gig service'
    );
  }

  private async handleGetSellers(message: GigMessage, channel: Channel): Promise<void> {
    const msg = message as ISeedGigMessage;
    const sellers: ISellerDocument[] = await this.sellerRepository.getRandomSellers(parseInt(`${msg.count}`, 10));
    await this.userProducer.publishDirectMessage(
      channel,
      'jobber-seed-gig',
      'receive-sellers',
      JSON.stringify({
        type: 'receiveSellers',
        sellers: sellers,
        count: msg.count
      }),
      'Message sent to gig service'
    );
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
      return (await this.queueConnection.connect()) as Channel;
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
    const handler = this.buyerHandlers.get(message.type);
    if (!handler) {
      this.log.log('warn', `Unknown buyer message type: ${message.type}`);
      return;
    }
    await handler(message);
  }

  private async handleReviewMessage(message: ReviewMessage, channel: Channel): Promise<void> {
    const handler = this.reviewHandlers.get(message.type);
    if (!handler) {
      this.log.log('warn', `Unknown review message type: ${message.type}`);
      return;
    }
    await handler(message, channel);
  }

  private async handleGigMessage(message: GigMessage, channel: Channel): Promise<void> {
    const handler = this.seedGigHandlers.get(message.type);
    if (!handler) {
      this.log.log('warn', `Unknown gig message type: ${message.type}`);
      return;
    }
    await handler(message, channel);
  }

  private async handleSellerMessage(message: SellerMessage): Promise<void> {
    const messageType = message.type;
    if (!messageType) {
      this.log.log('warn', 'Received seller message without a type');
      return;
    }
    const handler = this.sellerHandlers.get(messageType);
    if (!handler) {
      this.log.log('warn', `Unknown seller message type: ${messageType}`);
      return;
    }
    await handler(message);
  }
}
