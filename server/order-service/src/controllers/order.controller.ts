import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { OrderService } from '@order/services/order.service';
import { StripeService } from '@order/services/stripe.service';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import { IOrderAttributes } from '@order/models/order.schema';
import { IOrderDocument } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService
  ) {}

  async createIntent(req: Request, res: Response): Promise<void> {
    const { email, buyerId, price } = req.body;
    const paymentIntent: Stripe.PaymentIntent = await this.stripeService.createPaymentIntent(email, buyerId, price);
    res.status(StatusCodes.OK).json({
      message: 'Order intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const serviceFee = this.stripeService.calculateAmountInCents(req.body.price);
    const orderData: IOrderAttributes = {
      ...req.body,
      serviceFee
    };
    const order: IOrderDocument = await this.orderService.createOrder(orderData);
    res.status(StatusCodes.CREATED).json({
      message: 'Order created successfully',
      order: order
    });
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order: IOrderDocument | null = await this.orderService.getOrderById(orderId as string);
    res.status(StatusCodes.OK).json({
      message: 'Order retrieved successfully',
      order: order
    });
  }

  async getOrdersBySellerId(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const orders: IOrderDocument[] = await this.orderService.getOrdersBySellerId(sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Orders retrieved successfully',
      orders: orders
    });
  }
}
