import { Application } from 'express';
import { HealthRoute } from '@users/routes/health.routes';
import { BuyerRoute } from '@users/routes/buyer.routes';
import { SellerRoute } from '@users/routes/seller.routes';
import { container } from 'tsyringe';
import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);
  const buyerRoutes = container.resolve(BuyerRoute);
  const sellerRoutes = container.resolve(SellerRoute);

  app.use('', healthRoutes.routes());
  app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRoutes.routes());
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, sellerRoutes.routes());
};
