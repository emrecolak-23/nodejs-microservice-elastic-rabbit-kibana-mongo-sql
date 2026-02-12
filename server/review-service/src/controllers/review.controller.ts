import { injectable, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import { ReviewService } from '@review/services/review.service';

@injectable()
@singleton()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async addReview(req: Request, res: Response) {
    const review = await this.reviewService.addReview(req.body);
    res.status(201).json(review);
  }
}
