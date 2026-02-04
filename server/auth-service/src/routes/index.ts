import { Application } from 'express';
import { AuthRoutes } from '@auth/routes/auth.routes';
import { container } from 'tsyringe';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const authRoutes = container.resolve(AuthRoutes);

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes.routes());
};
