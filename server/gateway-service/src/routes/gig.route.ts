import express, { Router } from 'express';
import { GigController } from '@gateway/controllers';
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
    this.router.delete('/:gigId/:sellerId', this.gigController.deleteGig.bind(this.gigController));
    this.router.put('/:gigId', this.gigController.updateGig.bind(this.gigController));
    this.router.put('/active/:gigId', this.gigController.pauseOrUnpauseGig.bind(this.gigController));
    this.router.get('/search/:from/:size/:type', this.gigController.searchGigs.bind(this.gigController));
    this.router.get('/seed/:count', this.gigController.seedData.bind(this.gigController));
    this.router.get('/:gigId', this.gigController.getGigById.bind(this.gigController));
    this.router.get('/seller/:sellerId', this.gigController.getSellerGigs.bind(this.gigController));
    this.router.get('/seller/pause/:sellerId', this.gigController.getSellerPausedGigs.bind(this.gigController));
    this.router.get('/category/:username', this.gigController.getGigsByCategory.bind(this.gigController));
    this.router.get('/similar/:gigId', this.gigController.getMoreGigsLikeThis.bind(this.gigController));
    this.router.get('/top/:username', this.gigController.getTopRatedGigsByCategory.bind(this.gigController));
    return this.router;
  }
}
