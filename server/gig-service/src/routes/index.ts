import { Application } from 'express';
import { HealthRoute } from '@gig/routes/health.route';

import { container } from 'tsyringe';

// const BASE_PATH = '/api/v1/gig';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);

  app.use('', healthRoutes.routes());
};
