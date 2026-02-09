import express, { Router } from 'express';
import { GigController, SearchController } from '@gig/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@gig/middlewares';
import { gigCreateSchema, gigUpdateSchema, gigDeleteSchema, gigPauseOrUnpauseSchema } from '@gig/schemes/gig';

@singleton()
@injectable()
export class GigRoute {
  private router: Router;

  constructor(
    private readonly gigController: GigController,
    private readonly searchController: SearchController,
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
    this.router.get('/search/:from/:size/:type', this.searchController.searchGigs.bind(this.searchController));
    this.router.get('/top/:username', this.searchController.topRatedGigsByCategory.bind(this.searchController));
    this.router.get('/category/:username', this.searchController.gigByCategory.bind(this.searchController));
    this.router.get('/similar/:gigId', this.searchController.moreGigsLikeThis.bind(this.searchController));
    this.router.get('/:gigId', this.gigController.getGigById.bind(this.gigController));
    this.router.get('/seller/:sellerId', this.gigController.getSellerGigs.bind(this.gigController));
    this.router.get('/seller/pause/:sellerId', this.gigController.getSellerPausedGigs.bind(this.gigController));
    return this.router;
  }
}
