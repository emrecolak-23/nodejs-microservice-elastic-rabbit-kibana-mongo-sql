import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { OrderService } from '@order/services/order.service';
import { StripeService } from '@order/services/stripe.service';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import { IOrderAttributes } from '@order/models/order.schema';
import { IDeliveredWork, IOrderDocument } from '@emrecolak-23/jobber-share';

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

  async getOrdersByBuyerId(req: Request, res: Response): Promise<void> {
    const { buyerId } = req.params;
    const orders: IOrderDocument[] = await this.orderService.getOrdersByBuyerId(buyerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Orders retrieved successfully',
      orders: orders
    });
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const { paymentIntent, orderData } = req.body;
    const { orderId } = req.params;
    const refund: Stripe.Refund = await this.stripeService.refundPaymentIntent(paymentIntent);
    await this.orderService.cancelOrder(orderId as string, orderData);

    res.status(StatusCodes.OK).json({
      message: 'Order cancelled successfully',
      refund: refund
    });
  }

  async requestDeliveryExtension(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order: IOrderDocument = await this.orderService.requestDeliverExtension(orderId as string, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Delivery extension requested successfully',
      order: order
    });
  }

  async deliveryDate(req: Request, res: Response): Promise<void> {
    const { orderId, type } = req.params;
    const order: IOrderDocument =
      type === 'approve'
        ? await this.orderService.approveDeliveryExtension(orderId as string, req.body)
        : await this.orderService.rejectDeliveryExtension(orderId as string);
    res.status(StatusCodes.OK).json({
      message: 'Delivery date updated successfully',
      order: order
    });
  }

  async approveOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order: IOrderDocument = await this.orderService.approveOrder(orderId as string, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Order approved successfully',
      order: order
    });
  }

  async deliverOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    let file: string = req.body.file;
    const fileType: string = req.body.fileType;

    if (file) {
      file = await this.orderService.uploadOrderFile(file, fileType);
    }

    const deliveredWork: IDeliveredWork = {
      message: req.body.message,
      file,
      fileType,
      fileSize: req.body.fileSize,
      fileName: req.body.fileName
    };

    const order: IOrderDocument = await this.orderService.deliverOrder(orderId as string, true, deliveredWork);

    res.status(StatusCodes.OK).json({
      message: 'Order delivered successfully',
      order: order
    });
  }
}
