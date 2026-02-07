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

  async handle(message: ReviewMessage, channel: Channel): Promise<void> {
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
