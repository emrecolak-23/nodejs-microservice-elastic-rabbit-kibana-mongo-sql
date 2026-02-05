import { Application } from 'express';
import { AuthRoutes } from '@auth/routes/auth.routes';
import { HealthRoute } from '@auth/routes/health.routes';
import { container } from 'tsyringe';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const authRoutes = container.resolve(AuthRoutes);
const healthRoutes = container.resolve(HealthRoute);

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes.routes());
};
