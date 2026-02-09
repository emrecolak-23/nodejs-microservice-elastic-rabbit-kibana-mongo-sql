import { Application } from 'express';
import { container } from 'tsyringe';
import { HealthRoute } from '@chat/routes/health.route';

// import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

// const BASE_PATH = '/api/v1/chat';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);
  app.use('', healthRoutes.routes());
};
