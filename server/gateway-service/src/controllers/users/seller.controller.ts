import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { SellerService } from '@gateway/services/api/seller.service';

@injectable()
@singleton()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  async createSeller(req: Request, res: Response): Promise<void> {}
}
