import express, { Router } from 'express';
import { SellerController } from '@gateway/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class SellerRoute {
  private router: Router;

  constructor(private readonly sellerController: SellerController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/seller/create', this.sellerController.createSeller.bind(this.sellerController));
    this.router.post('/seller/:sellerId', this.sellerController.updateSeller.bind(this.sellerController));
    this.router.get('/seller/id/:sellerId', this.sellerController.getSellerById.bind(this.sellerController));
    this.router.get('/seller/username/:username', this.sellerController.getSellerByUsername.bind(this.sellerController));
    this.router.get('/seller/random/:count', this.sellerController.getRandomSellers.bind(this.sellerController));
    this.router.put('/seller/seed/:count', this.sellerController.createRandomSellers.bind(this.sellerController));

    return this.router;
  }
}
