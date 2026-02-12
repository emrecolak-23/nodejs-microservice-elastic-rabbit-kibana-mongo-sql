import express, { Router } from 'express';
import { ReviewController } from '@gateway/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class ReviewRoute {
  private router: Router;

  constructor(private readonly reviewController: ReviewController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/gig/:gigId', this.reviewController.getReviewsByGigId.bind(this.reviewController));
    this.router.get('/seller/:sellerId', this.reviewController.getReviewsBySellerId.bind(this.reviewController));
    this.router.post('/', this.reviewController.addReview.bind(this.reviewController));

    return this.router;
  }
}
