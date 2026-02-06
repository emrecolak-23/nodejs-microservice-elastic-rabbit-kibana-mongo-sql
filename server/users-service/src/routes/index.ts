import { Application } from 'express';
import { HealthRoute } from './health.routes';
import { container } from 'tsyringe';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';

const healthRoutes = container.resolve(HealthRoute);

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BUYER_BASE_PATH, verifyGatewayRequest, () => console.log('Buyer routes'));
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, () => console.log('Seller routes'));
};
