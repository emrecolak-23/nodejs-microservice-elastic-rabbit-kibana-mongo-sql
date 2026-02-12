import { Application } from 'express';
import { container } from 'tsyringe';
import { HealthRoute } from '@gateway/routes/health.route';
import { AuthRoute } from '@gateway/routes/auth.route';
import { SearchRoute } from './search.route';
import { SeedRoute } from './seed.route';
import { BuyerRoute } from './buyer.route';
import { AuthMiddleware } from '@gateway/middlewares';
import { CurrentUserRoute } from './current-user.route';
import { SellerRoute } from './seller.route';
import { GigRoute } from './gig.route';
import { MessageRoute } from './message.route';
import { OrderRoute } from './order.route';
import { ReviewRoute } from './review.route';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  const healthRoute = container.resolve(HealthRoute);
  const authRoute = container.resolve(AuthRoute);
  const searchRoute = container.resolve(SearchRoute);
  const seedRoute = container.resolve(SeedRoute);
  const buyerRoute = container.resolve(BuyerRoute);
  const currentUserRoute = container.resolve(CurrentUserRoute);
  const authMiddleware = container.resolve(AuthMiddleware);
  const sellerRoute = container.resolve(SellerRoute);
  const gigRoute = container.resolve(GigRoute);
  const messageRoute = container.resolve(MessageRoute);
  const orderRoute = container.resolve(OrderRoute);
  const reviewRoute = container.resolve(ReviewRoute);

  app.use('', healthRoute.routes());

  app.use(`${BASE_PATH}/auth`, authRoute.routes());
  app.use(`${BASE_PATH}/auth`, searchRoute.routes());
  app.use(`${BASE_PATH}/auth`, seedRoute.routes());
  app.use(
    `${BASE_PATH}/gig`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    gigRoute.routes()
  );
  app.use(
    `${BASE_PATH}/auth`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    currentUserRoute.routes()
  );
  app.use(
    `${BASE_PATH}/buyer`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    buyerRoute.routes()
  );
  app.use(
    `${BASE_PATH}/seller`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    sellerRoute.routes()
  );

  app.use(
    `${BASE_PATH}/message`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    messageRoute.routes()
  );

  app.use(
    `${BASE_PATH}/order`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    orderRoute.routes()
  );

  app.use(
    `${BASE_PATH}/review`,
    authMiddleware.verifyUser.bind(authMiddleware),
    authMiddleware.checkAuthentication.bind(authMiddleware),
    reviewRoute.routes()
  );
};
