import { Application } from 'express';
import { container } from 'tsyringe';
import { HealthRoute } from '@order/routes/health.route';
import { OrderRoute } from '@order/routes/order.route';
import { NotificationRoute } from '@order/routes/notification.route';

import { verifyGatewayRequest } from '@emrecolak-23/jobber-share';

const BASE_PATH = '/api/v1/order';

export const appRoutes = (app: Application) => {
  const healthRoutes = container.resolve(HealthRoute);
  const orderRoutes = container.resolve(OrderRoute);
  const notificationRoutes = container.resolve(NotificationRoute);
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, orderRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, notificationRoutes.routes());
};
