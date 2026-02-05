import express, { Router } from 'express';
import { SearchController } from '@auth/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class SearchRoute {
  private router: Router;

  constructor(private readonly searchController: SearchController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/search/gig/:gigId', this.searchController.singleGigById.bind(this.searchController));
    this.router.get('/search/gig/:from/:size/:type', this.searchController.searchGigs.bind(this.searchController));
    return this.router;
  }
}
