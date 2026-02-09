import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { GigService } from '@gateway/services/api/gig.service';
import { AxiosResponse } from 'axios';

@injectable()
@singleton()
export class GigController {
  constructor(private readonly gigService: GigService) {}

  async createGig(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.gigService.createGig(req.body);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async deleteGig(req: Request, res: Response): Promise<void> {
    const { gigId, sellerId } = req.params;
    const response: AxiosResponse = await this.gigService.deleteGig(gigId as string, sellerId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async updateGig(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.gigService.updateGig(gigId as string, req.body);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async pauseOrUnpauseGig(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.gigService.updateActiveGigProp(gigId as string, req.body.active as boolean);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async searchGigs(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();

    const response: AxiosResponse = await this.gigService.searchGigs(queryString, from as string, size as string, type as string);

    res.status(StatusCodes.OK).json({
      message: response.data.message,
      total: response.data.total,
      gigs: response.data.gigs
    });
  }

  async seedData(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const response: AxiosResponse = await this.gigService.seed(count as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message
    });
  }

  async getGigById(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.gigService.getGigById(gigId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gig: response.data.gig
    });
  }

  async getSellerGigs(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const response: AxiosResponse = await this.gigService.getSellerGigs(sellerId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gigs: response.data.gigs
    });
  }

  async getSellerPausedGigs(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const response: AxiosResponse = await this.gigService.getSellerPausedGigs(sellerId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gigs: response.data.gigs
    });
  }

  async getMoreGigsLikeThis(req: Request, res: Response): Promise<void> {
    const { gigId } = req.params;
    const response: AxiosResponse = await this.gigService.getMoreGigsLikeThis(gigId as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gigs: response.data.gigs
    });
  }

  async getTopRatedGigsByCategory(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const response: AxiosResponse = await this.gigService.getTopRatedGigsByCategory(username as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gigs: response.data.gigs
    });
  }

  async getGigsByCategory(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const response: AxiosResponse = await this.gigService.getGigsByCategory(username as string);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      gigs: response.data.gigs
    });
  }
}
