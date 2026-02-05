import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gateway/configs/env.config';

@singleton()
@injectable()
export class SearchController {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly authService: AuthService
  ) {}

  async gigById(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.authService.getGig(gigId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async gigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();

    this.log.info(`Query string: ${queryString}`);
    const response: AxiosResponse = await this.authService.getGigs(queryString, from as string, size as string, type as string);

    res.status(StatusCodes.OK).json({
      message: response.data.message,
      total: response.data.total,
      gig: response.data.gigs
    });
  }
}
