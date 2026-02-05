import express, { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { SeedsController } from '@auth/controllers';

@singleton()
@injectable()
export class SeedsRoute {
  private router: Router;

  constructor(private readonly seedsController: SeedsController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/seeds/:count', this.seedsController.createSeeds.bind(this.seedsController));

    return this.router;
  }
}
