import { Application } from 'express';
import { container } from 'tsyringe';
import { HealthRoute } from '@review/routes/health.route';
import { ReviewRoute } from '@review/routes/review.route';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const BASE_PATH = '/api/v1/review';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);
  const reviewRoutes = container.resolve(ReviewRoute);
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, reviewRoutes.routes());
};
