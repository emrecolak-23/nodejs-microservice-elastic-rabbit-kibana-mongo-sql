import express, { Router } from 'express';
import { SeedController } from '@gateway/controllers/auth/seed.controller';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class SeedRoute {
  private router: Router;

  constructor(private readonly seedController: SeedController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/seeds/:count', this.seedController.createSeeds.bind(this.seedController));

    return this.router;
  }
}
