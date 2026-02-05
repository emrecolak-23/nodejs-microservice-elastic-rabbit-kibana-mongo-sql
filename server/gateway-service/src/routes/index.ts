import { Application } from 'express';
import { container } from 'tsyringe';
import { HealthRoute } from '@gateway/routes/health.route';
import { AuthRoute } from '@gateway/routes/auth.route';
import { SearchRoute } from './search.route';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  const healthRoute = container.resolve(HealthRoute);
  const authRoute = container.resolve(AuthRoute);
  const searchRoute = container.resolve(SearchRoute);
  app.use('', healthRoute.routes());
  app.use(`${BASE_PATH}/auth`, authRoute.routes());
  app.use(`${BASE_PATH}/auth`, searchRoute.routes());
};
