import { injectable, singleton } from 'tsyringe';
import { ReviewRepository } from '@review/repositories/review.repository';
import { IReviewDocument, IReviewMessageDetails } from '@emrecolak-23/jobber-share';
import { ReviewerProducer } from '@review/queues/reviewer.producer';

interface IReviewerObjectKeys {
  [key: string]: string | number | Date | undefined;
}

const objKeys: IReviewerObjectKeys = {
  review: 'review',
  rating: 'rating',
  country: 'country',
  gigid: 'gigId',
  reviewerid: 'reviewerId',
  createdat: 'createdAt',
  orderid: 'orderId',
  sellerid: 'sellerId',
  reviewerimage: 'reviewerImage',
  reviewerusername: 'reviewerUsername',
  reviewtype: 'reviewType'
};

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
      exchangeName: 'jobber-review',
      message: JSON.stringify(reviewMessage),
      logMessage: 'Review message sent to reviewer service'
    });

    const result: IReviewDocument = Object.fromEntries(
      Object.entries(row).map(([key, value]: [string, unknown]) => [objKeys[key] || key, value])
    );
    return result;
  }

  async getReviewsByGigId(gigId: string): Promise<IReviewDocument[]> {
    const reviews: IReviewDocument[] = await this.reviewRepository.getReviewsByGigId(gigId);
    const mappedResult: IReviewDocument[] = reviews.map((review) => {
      return Object.fromEntries(Object.entries(review).map(([key, value]: [string, unknown]) => [objKeys[key] || key, value]));
    });
    return mappedResult;
  }

  async getReviewsBySellerId(sellerId: string): Promise<IReviewDocument[]> {
    const reviews: IReviewDocument[] = await this.reviewRepository.getReviewsBySellerId(sellerId);
    const mappedResult: IReviewDocument[] = reviews.map((review) => {
      return Object.fromEntries(Object.entries(review).map(([key, value]: [string, unknown]) => [objKeys[key] || key, value]));
    });
    return mappedResult;
  }
}
