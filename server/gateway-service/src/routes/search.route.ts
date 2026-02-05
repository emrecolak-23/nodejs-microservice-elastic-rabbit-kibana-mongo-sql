import express, { Router } from 'express';
import { SearchController } from '@gateway/controllers/auth/search.controller';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class SearchRoute {
  private router: Router;

  constructor(private readonly searchController: SearchController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/search/gigs/:gigId', this.searchController.gigById.bind(this.searchController));
    this.router.get('/search/gigs/:from/:size/:type', this.searchController.gigs.bind(this.searchController));
    return this.router;
  }
}
