import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { BuyerService } from '@gateway/services/api/buyer.service';
import { AxiosResponse } from 'axios';

@injectable()
@singleton()
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  async getCurrentBuyerByUsername(_req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.buyerService.getCurrentBuyerByUsername();
    res.status(response.status).json({
      message: response.data.message,
      buyer: response.data.buyer
    });
  }

  async getBuyerByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const response: AxiosResponse = await this.buyerService.getBuyerByUsername(username as string);
    res.status(response.status).json({
      message: response.data.message,
      buyer: response.data.buyer
    });
  }

  async getBuyerByEmail(_req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.buyerService.getBuyerByEmail();
    res.status(response.status).json({
      message: response.data.message,
      buyer: response.data.buyer
    });
  }
}
