import express, { Router } from 'express';
import { OrderController } from '@gateway/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class OrderRoute {
  private router: Router;

  constructor(private readonly orderController: OrderController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/:orderId', this.orderController.getOrderById.bind(this.orderController));
    this.router.get('/seller/:sellerId', this.orderController.getOrdersBySellerId.bind(this.orderController));
    this.router.get('/buyer/:buyerId', this.orderController.getOrdersByBuyerId.bind(this.orderController));
    this.router.post('', this.orderController.createOrder.bind(this.orderController));
    this.router.post('/create-payment-intent', this.orderController.createPaymentIntent.bind(this.orderController));
    this.router.put('/cancel/:orderId', this.orderController.cancelOrder.bind(this.orderController));
    this.router.put('/extension/:orderId', this.orderController.requestDeliveryDateExtension.bind(this.orderController));
    this.router.put('/deliver-order/:orderId', this.orderController.deliverOrder.bind(this.orderController));
    this.router.put('/approve-order/:orderId', this.orderController.approveOrder.bind(this.orderController));
    this.router.put('/gig/:type/:orderId', this.orderController.updateDeliveryDate.bind(this.orderController));
    this.router.get('/notification/:userTo', this.orderController.getNotifications.bind(this.orderController));
    this.router.put('/notification/mark-as-read', this.orderController.markNotificationAsRead.bind(this.orderController));
    return this.router;
  }
}
