import express, { Router } from 'express';
import { OrderController } from '@order/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@order/middlewares';
import { orderSchema } from '@order/schemes/order';

@singleton()
@injectable()
export class OrderRoute {
  private router: Router;

  constructor(
    private readonly orderController: OrderController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/:orderId', this.orderController.getOrderById.bind(this.orderController));
    this.router.get('/seller/:sellerId', this.orderController.getOrdersBySellerId.bind(this.orderController));
    this.router.get('/buyer/:buyerId', this.orderController.getOrdersByBuyerId.bind(this.orderController));
    this.router.post('', this.validateMiddleware.validate(orderSchema), this.orderController.createOrder.bind(this.orderController));
    this.router.post('/create-payment-intent', this.orderController.createIntent.bind(this.orderController));
    this.router.put('/cancel/:orderId', this.orderController.cancelOrder.bind(this.orderController));
    this.router.put('/extension/:orderId', this.orderController.requestDeliveryExtension.bind(this.orderController));
    this.router.put('/delivery-order/:orderId', this.orderController.deliverOrder.bind(this.orderController));
    this.router.put('/approve-order/:orderId', this.orderController.approveOrder.bind(this.orderController));
    this.router.put('/gig/:type/:orderId', this.orderController.deliveryDate.bind(this.orderController));
    return this.router;
  }
}
