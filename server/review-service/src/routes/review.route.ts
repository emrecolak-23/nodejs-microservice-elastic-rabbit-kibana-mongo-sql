import express, { Router } from 'express';
import { ReviewController } from '@review/controllers';
import { injectable, singleton } from 'tsyringe';
import { reviewSchema } from '@review/schemes/review';
import { ValidateMiddleware } from '@review/middlewares';

@singleton()
@injectable()
export class ReviewRoute {
  private router: Router;

  constructor(
    private readonly reviewController: ReviewController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/', this.validateMiddleware.validate(reviewSchema), this.reviewController.addReview.bind(this.reviewController));
    this.router.get('/gig/:gigId', this.reviewController.getReviewsByGigId.bind(this.reviewController));
    this.router.get('/seller/:sellerId', this.reviewController.getReviewsBySellerId.bind(this.reviewController));

    return this.router;
  }
}
