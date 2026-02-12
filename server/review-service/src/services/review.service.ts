import { injectable, singleton } from 'tsyringe';
import { ReviewRepository } from '@review/repositories/review.repository';
import { IReviewDocument } from '@emrecolak-23/jobber-share';

@singleton()
@injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async addReview(data: IReviewDocument): Promise<IReviewDocument> {
    return this.reviewRepository.addReview(data);
  }
}
