import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { IPaginateProps, winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';
import { SearchService } from '@gig/services/search.service';
import { StatusCodes } from 'http-status-codes';
import { GigCache } from '@gig/cache/gig.cache';

@singleton()
@injectable()
export class SearchController {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceSearchController', 'debug');

  constructor(
    private readonly config: EnvConfig,
    private readonly searchService: SearchService,
    private readonly gigCache: GigCache
  ) {}

  async searchGigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    const paginate: IPaginateProps = { from: `${from}`, size: parseInt(`${size}`), type: `${type}` };
    this.log.info(`Paginate in gig service: ${JSON.stringify(paginate)}`);
    const gigs = await this.searchService.searchGigs(
      `${req.query.query}`,
      paginate,
      `${req.query.delivery_time}`,
      parseInt(req.query.minprice as string),
      parseInt((req.query.maxprice as string) || '0')
    );
    res.status(StatusCodes.OK).json({
      message: 'Gigs search result',
      total: gigs.total,
      gigs: gigs.hits
    });
  }

  async topRatedGigsByCategory(req: Request, res: Response): Promise<void> {
    const category = await this.gigCache.getUserSelectedGigCategory(`selectedCategories:${req.params.username}`);

    console.log(category, 'category');

    const gigs = await this.searchService.getTopRatedGigsByCategory(`${category}`);

    res.status(StatusCodes.OK).json({
      message: 'Top rated gigs by category',
      total: gigs.total,
      gigs: gigs.hits
    });
  }

  async gigByCategory(req: Request, res: Response): Promise<void> {
    const category = await this.gigCache.getUserSelectedGigCategory(`selectedCategories:${req.params.username}`);
    const gigs = await this.searchService.gigsSearchByCategory(`${category}`);

    res.status(StatusCodes.OK).json({
      message: 'Gigs search result by category',
      total: gigs.total,
      gigs: gigs.hits
    });
  }

  async moreGigsLikeThis(req: Request, res: Response): Promise<void> {
    const gigs = await this.searchService.getMoreGigsLikeThis(`${req.params.gigId}`);

    res.status(StatusCodes.OK).json({
      message: 'More gigs like this',
      total: gigs.total,
      gigs: gigs.hits
    });
  }
}
