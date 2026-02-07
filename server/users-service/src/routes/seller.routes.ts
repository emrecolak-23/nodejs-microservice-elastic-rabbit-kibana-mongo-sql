import express, { Router } from 'express';
import { SellerController } from '@users/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@users/middlewares';
import { sellerSchema } from '@users/schemes/seller.scheme';
@singleton()
@injectable()
export class SellerRoute {
  private router: Router;

  constructor(
    private readonly sellerController: SellerController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post(
      '/create',
      this.validateMiddleware.validate(sellerSchema),
      this.sellerController.createSeller.bind(this.sellerController)
    );
    this.router.post(
      '/:sellerId',
      this.validateMiddleware.validateParams(sellerSchema),
      this.sellerController.updateSeller.bind(this.sellerController)
    );

    this.router.get('/id/:sellerId', this.sellerController.getSellerById.bind(this.sellerController));
    this.router.get('/username/:username', this.sellerController.getSellerByUsername.bind(this.sellerController));
    this.router.get('/random/:count', this.sellerController.getRandomSellers.bind(this.sellerController));

    this.router.put('/seed/:count', this.sellerController.createRandomSellers.bind(this.sellerController));
    return this.router;
  }
}
