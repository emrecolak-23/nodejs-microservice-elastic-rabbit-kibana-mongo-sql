import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { ReviewService } from '@gateway/services/api/review.service';
import { AxiosResponse } from 'axios';

@singleton()
@injectable()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async getReviewsByGigId(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.reviewService.getReviewsByGigId(gigId as string);
    res.status(response.status).json({
      message: response.data.message,
      reviews: response.data.reviews
    });
  }

  async getReviewsBySellerId(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const response: AxiosResponse = await this.reviewService.getReviewsBySellerId(sellerId as string);
    res.status(response.status).json({
      message: response.data.message,
      reviews: response.data.reviews
    });
  }

  async addReview(req: Request, res: Response): Promise<void> {
    const { body } = req;
    const response: AxiosResponse = await this.reviewService.addReview(body);
    res.status(response.status).json({
      message: response.data.message,
      review: response.data.review
    });
  }
}
