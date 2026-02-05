import { injectable, singleton } from 'tsyringe';
import { SearchService } from '@auth/services/search.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IPaginateProps } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  async searchGigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    const { query, delivery_time, minPrice, maxPrice } = req.query;
    const paginate: IPaginateProps = { from: `${from}`, size: parseInt(`${size}`), type: `${type}` };
    const gigs = await this.searchService.searchGigs(
      query as string,
      paginate,
      delivery_time as string,
      parseInt(minPrice as string),
      parseInt(maxPrice as string)
    );

    res.status(StatusCodes.OK).json({
      message: 'Gigs search result',
      total: gigs.total,
      hits: gigs.hits
    });
  }

  async singleGigById(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const gig = await this.searchService.singleGigById(gigId as string);
    res.status(StatusCodes.OK).json({
      message: 'Single gig result',
      gig
    });
  }
}
