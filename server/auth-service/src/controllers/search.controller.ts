import { injectable, singleton } from 'tsyringe';
import { SearchService } from '@auth/services/search.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IPaginateProps, winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@auth/config/env.config';

@injectable()
@singleton()
export class SearchController {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly searchService: SearchService
  ) {}

  async searchGigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    const { query, delivery_time, minPrice, maxPrice } = req.query;
    this.log.info(`Search query in auth service: ${JSON.stringify(query)}`);
    const paginate: IPaginateProps = { from: `${from}`, size: parseInt(`${size}`), type: `${type}` };
    this.log.info(`Paginate in auth service: ${JSON.stringify(paginate)}`);
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
      gigs: gigs.hits
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
