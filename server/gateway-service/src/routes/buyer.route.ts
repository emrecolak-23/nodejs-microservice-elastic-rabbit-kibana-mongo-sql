import express, { Router } from 'express';
import { BuyerController } from '@gateway/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class BuyerRoute {
  private router: Router;

  constructor(private readonly buyerController: BuyerController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/buyer/email', this.buyerController.getBuyerByEmail.bind(this.buyerController));
    this.router.get('/buyer/username', this.buyerController.getCurrentBuyerByUsername.bind(this.buyerController));
    this.router.get('/buyer/:username', this.buyerController.getBuyerByUsername.bind(this.buyerController));
    return this.router;
  }
}
