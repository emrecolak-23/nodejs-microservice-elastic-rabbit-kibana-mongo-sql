import { injectable, singleton } from 'tsyringe';
import { ReviewRepository } from '@review/repositories/review.repository';
import { IReviewDocument, IReviewMessageDetails } from '@emrecolak-23/jobber-share';
import { ReviewerProducer } from '@review/queues/reviewer.producer';
import { reviewChannel } from '@review/server';

@singleton()
@injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewerProducer: ReviewerProducer
  ) {}

  async addReview(data: IReviewDocument): Promise<IReviewDocument> {
    const row = await this.reviewRepository.addReview(data);

    const reviewMessage: IReviewMessageDetails = {
      gigId: data.gigId,
      reviewerId: data.reviewerId,
      sellerId: data.sellerId,
      review: data.review,
      rating: data.rating,
      orderId: data.orderId,
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toISOString(),
      type: data.reviewType!
    };

    await this.reviewerProducer.publishFanoutMessage({
      channel: reviewChannel,
      exchangeName: 'reviewer',
      message: JSON.stringify(reviewMessage),
      logMessage: 'Review message sent to reviewer service'
    });

    return row;
  }
}
