import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';

@singleton()
@injectable()
export class SearchController {
  constructor(private readonly authService: AuthService) {}

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
    let query = '';

    const objList = Object.entries(req.query);
    const lastItemIndex = objList.length - 1;
    objList.forEach(([key, value], index) => {
      query += `${key}=${value}${index === lastItemIndex ? '' : '&'}`;
    });

    const response: AxiosResponse = await this.authService.getGigs(query, from as string, size as string, type as string);

    res.status(StatusCodes.OK).json({
      message: response.data.message,
      total: response.data.total,
      gig: response.data.gigs
    });
  }
}
