import { injectable } from 'tsyringe';
import { Channel } from 'amqplib';
import { ReviewMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { SellerRepository } from '@users/repositories';
import { UserProducer } from '@users/queues/user.producer';
import { IReviewMessageStrategy } from './IReviewMessageStrategy';

@injectable()
export class ReviewCreateStrategy implements IReviewMessageStrategy {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly userProducer: UserProducer
  ) {}

  getType(): string {
    return MESSAGE_TYPES.REVIEW.CREATE_REVIEW;
  }

  async handle(message: ReviewMessage, _channel: Channel): Promise<void> {
    await this.sellerRepository.updateSellerReview(message);
    await this.userProducer.publishDirectMessage({
      exchangeName: 'jobber-update-gig',
      routingKey: 'update-gig',
      message: JSON.stringify({
        type: 'update-gig',
        gigReview: message
      }),
      logMessage: 'Message sent to gig service'
    });
  }
}
