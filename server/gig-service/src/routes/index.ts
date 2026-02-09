import { Application } from 'express';
import { HealthRoute } from '@gig/routes/health.route';
import { GigRoute } from '@gig/routes/gig.route';

import { container } from 'tsyringe';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const BASE_PATH = '/api/v1/gig';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);
  const gigRoutes = container.resolve(GigRoute);

  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes.routes());
};
