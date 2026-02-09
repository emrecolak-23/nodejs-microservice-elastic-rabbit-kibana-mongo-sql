import express, { Router } from 'express';
import { GigController } from '@gig/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@gig/middlewares';
import { gigCreateSchema, gigUpdateSchema, gigDeleteSchema, gigPauseOrUnpauseSchema } from '@gig/schemes/gig';

@singleton()
@injectable()
export class GigRoute {
  private router: Router;

  constructor(
    private readonly gigController: GigController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/create', this.validateMiddleware.validate(gigCreateSchema), this.gigController.createGig.bind(this.gigController));
    this.router.put('/:gigId', this.validateMiddleware.validate(gigUpdateSchema), this.gigController.updateGig.bind(this.gigController));
    this.router.delete(
      '/:gigId/:sellerId',
      this.validateMiddleware.validate(gigDeleteSchema),
      this.gigController.deleteGig.bind(this.gigController)
    );
    this.router.put(
      '/active/:gigId',
      this.validateMiddleware.validate(gigPauseOrUnpauseSchema),
      this.gigController.pauseOrUnpauseGig.bind(this.gigController)
    );
    return this.router;
  }
}
