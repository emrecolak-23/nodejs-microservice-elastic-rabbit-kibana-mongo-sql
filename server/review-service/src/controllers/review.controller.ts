import { injectable, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import { ReviewService } from '@review/services/review.service';
import { StatusCodes } from 'http-status-codes';
import { IReviewDocument } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async addReview(req: Request, res: Response) {
    const review: IReviewDocument = await this.reviewService.addReview(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Review created successfully',
      review
    });
  }

  async getReviewsByGigId(req: Request, res: Response) {
    const reviews: IReviewDocument[] = await this.reviewService.getReviewsByGigId(req.params.gigId as string);
    res.status(StatusCodes.OK).json({
      message: 'Reviews fetched successfully',
      reviews
    });
  }

  async getReviewsBySellerId(req: Request, res: Response) {
    const reviews: IReviewDocument[] = await this.reviewService.getReviewsBySellerId(req.params.sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Reviews fetched successfully',
      reviews
    });
  }
}
