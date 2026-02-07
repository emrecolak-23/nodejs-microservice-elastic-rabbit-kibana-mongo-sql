import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { SellerService } from '@users/services';

@injectable()
@singleton()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}
}
