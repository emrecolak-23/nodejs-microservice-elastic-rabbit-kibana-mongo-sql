import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { SellerService } from '@gateway/services/api/seller.service';

@injectable()
@singleton()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  async createSeller(req: Request, res: Response): Promise<void> {}
}
