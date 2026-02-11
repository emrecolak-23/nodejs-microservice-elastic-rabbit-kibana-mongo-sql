import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { OrderService } from '@order/services/order.service';
import { EnvConfig } from '@order/config';
import { StripeService } from '@order/services/stripe.service';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';

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
}
