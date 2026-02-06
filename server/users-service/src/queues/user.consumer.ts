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
  MESSAGE_TYPES,
  BuyerMessage,
  SellerMessage,
  ReviewMessage
} from '@users/queues/types/consumer.types';
import { UserProducer } from './user.producer';

@injectable()
@singleton()
export class UserConsumer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'usersServiceConsumer', 'debug');

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection,
    private readonly buyerRepository: BuyerRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly userProducer: UserProducer
  ) {}

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
    if (message.type === MESSAGE_TYPES.BUYER.AUTH) {
      const buyer: IBuyerAttributes = {
        username: message.username,
        email: message.email,
        profilePicture: message.profilePicture,
        country: message.country,
        isSeller: false,
        purchasedGigs: []
      };
      await this.buyerRepository.createBuyer(buyer);
    } else {
      await this.buyerRepository.updateBuyerPurchasedGigsProp(
        message.buyerId,
        message.purchasedGigId,
        message.type
      );
    }
  }

  private async handleReviewMessage(message: ReviewMessage, channel: Channel): Promise<void> {
    if (message.type === MESSAGE_TYPES.REVIEW.CREATE_REVIEW) {
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
  }

  private async handleSellerMessage(message: SellerMessage): Promise<void> {
    switch (message.type) {
      case MESSAGE_TYPES.SELLER.CREATE_ORDER:
        await this.sellerRepository.incrementSellerNumericField(
          (message as ISellerCreateOrderMessage).sellerId,
          'ongoingJobs',
          (message as ISellerCreateOrderMessage).ongoingJobs
        );
        break;
      case MESSAGE_TYPES.SELLER.APPROVE_ORDER:
        await this.sellerRepository.updateSellerCompletedJobsCount(message as IOrderMessage);
        break;
      case MESSAGE_TYPES.SELLER.UPDATE_GIG_COUNT:
        await this.sellerRepository.incrementSellerNumericField(
          (message as ISellerUpdateGigCountMessage).gigSellerId,
          'totalGigs',
          (message as ISellerUpdateGigCountMessage).count
        );
        break;
      case MESSAGE_TYPES.SELLER.CANCEL_ORDER:
        await this.sellerRepository.updateSellerCancelledJobsCount((message as ISellerCancelOrderMessage).sellerId);
        break;
      default:
        this.log.log('warn', `Unknown seller message type: ${(message as any).type}`);
    }
  }
}
