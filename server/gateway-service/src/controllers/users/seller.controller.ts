import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { SellerService } from '@gateway/services/api/seller.service';
import { AxiosResponse } from 'axios';

@injectable()
@singleton()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  async createSeller(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.createSeller(req.body);
    res.status(response.status).json({
      message: response.data.message,
      seller: response.data.seller
    });
  }

  async updateSeller(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.updateSeller(req.params.sellerId as string, req.body);
    res.status(response.status).json({
      message: response.data.message,
      seller: response.data.seller
    });
  }

  async getSellerById(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.getSellerById(req.params.sellerId as string);
    res.status(response.status).json({
      message: response.data.message,
      seller: response.data.seller
    });
  }

  async getSellerByUsername(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.getSellerByUsername(req.params.username as string);
    res.status(response.status).json({
      message: response.data.message,
      seller: response.data.seller
    });
  }

  async getRandomSellers(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.getRandomSellers(parseInt(req.params.count as string, 10));
    res.status(response.status).json({
      message: response.data.message,
      sellers: response.data.sellers
    });
  }

  async createRandomSellers(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.sellerService.seed(req.params.count as string);
    res.status(response.status).json({
      message: response.data.message
    });
  }
}
