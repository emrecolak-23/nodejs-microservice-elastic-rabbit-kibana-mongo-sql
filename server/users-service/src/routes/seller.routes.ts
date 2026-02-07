import express, { Router } from 'express';
import { SellerController } from '@users/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class SellerRoute {
  private router: Router;

  constructor(private readonly sellerController: SellerController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/create', this.sellerController.createSeller.bind(this.sellerController));
    this.router.post('/:sellerId', this.sellerController.updateSeller.bind(this.sellerController));
    return this.router;
  }
}
