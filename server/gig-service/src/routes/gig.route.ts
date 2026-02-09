import express, { Router } from 'express';
import { GigController } from '@gig/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class GigRoute {
  private router: Router;

  constructor(private readonly gigController: GigController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/create', this.gigController.createGig.bind(this.gigController));

    return this.router;
  }
}
