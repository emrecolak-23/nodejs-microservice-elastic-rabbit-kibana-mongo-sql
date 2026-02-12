import { injectable, singleton } from 'tsyringe';
import { Database } from '@review/loaders';
import { IReviewDocument } from '@emrecolak-23/jobber-share';
import { QueryResult } from 'pg';

@singleton()
@injectable()
export class ReviewRepository {
  constructor(private readonly database: Database) {}

  async addReview(data: IReviewDocument): Promise<IReviewDocument> {
    const { gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country } = data;

    const createdAtDate = new Date();
    const updatedAtDate = new Date();

    const { rows } = await this.database.query(
      'INSERT INTO reviews(gigId, reviewerId, orderId, sellerId, review, reviewerImage, reviewerUsername, country, reviewType, rating, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [
        gigId,
        reviewerId,
        orderId,
        sellerId,
        review,
        reviewerImage,
        reviewerUsername,
        country,
        reviewType,
        rating,
        createdAtDate,
        updatedAtDate
      ]
    );

    return rows[0] as IReviewDocument;
  }

  async getReviewsByGigId(gigId: string): Promise<IReviewDocument[]> {
    const { rows } = (await this.database.query('SELECT * FROM reviews WHERE reviews.gigId = $1 ORDER BY createdAt DESC', [
      gigId
    ])) as QueryResult<IReviewDocument>;

    return rows as IReviewDocument[];
  }

  async getReviewsBySellerId(sellerId: string): Promise<IReviewDocument[]> {
    const { rows } = (await this.database.query(
      'SELECT * FROM reviews WHERE reviews.sellerId = $1 AND reviews.reviewType = $2 ORDER BY createdAt DESC',
      [sellerId, 'seller-review']
    )) as QueryResult<IReviewDocument>;

    return rows as IReviewDocument[];
  }
}
