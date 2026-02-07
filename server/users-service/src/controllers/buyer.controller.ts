import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { BuyerService } from '@users/services';
import { StatusCodes } from 'http-status-codes';
import { IAuthPayload } from '@emrecolak-23/jobber-share';
import { IBuyerDocument } from '@users/models/buyer.schema';

@injectable()
@singleton()
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  async getBuyerByEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.currentUser as IAuthPayload;
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByEmail(email);
    res.status(StatusCodes.OK).json({
      message: 'Buyer profile',
      buyer
    });
  }

  async getBuyerByCurrentUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.currentUser as IAuthPayload;
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByUsername(username);
    res.status(StatusCodes.OK).json({
      message: 'Buyer profile',
      buyer
    });
  }

  async getBuyerByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByUsername(username as string);
    res.status(StatusCodes.OK).json({
      message: 'Buyer profile',
      buyer
    });
  }
}
