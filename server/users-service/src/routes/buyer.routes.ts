import express, { Router } from 'express';
import { BuyerController } from '@users/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class BuyerRoute {
  private router: Router;

  constructor(private readonly buyerController: BuyerController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/username', this.buyerController.getBuyerByCurrentUsername.bind(this.buyerController));
    this.router.get('/:username', this.buyerController.getBuyerByUsername.bind(this.buyerController));
    this.router.get('/email', this.buyerController.getBuyerByEmail.bind(this.buyerController));
    return this.router;
  }
}
