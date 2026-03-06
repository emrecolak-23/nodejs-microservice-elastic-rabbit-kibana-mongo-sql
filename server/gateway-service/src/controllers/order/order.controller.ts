import { injectable, singleton } from 'tsyringe';
import { OrderService } from '@gateway/services/api/order.service';
import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';

@singleton()
@injectable()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    const { price, buyerId, email } = req.body;
    const response: AxiosResponse = await this.orderService.createOrderIntent(price, buyerId, email);
    res.status(response.status).json({
      message: response.data.message,
      clientSecret: response.data.clientSecret,
      paymentIntentId: response.data.paymentIntentId
    });
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = req.body?.order ?? req.body;

    const response: AxiosResponse = await this.orderService.createOrder(order);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    const orderId = req.params.orderId as string;
    const response: AxiosResponse = await this.orderService.getOrderById(orderId);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async getOrdersBySellerId(req: Request, res: Response): Promise<void> {
    const sellerId = req.params.sellerId as string;
    const response: AxiosResponse = await this.orderService.sellerOrders(sellerId);
    res.status(response.status).json({
      message: response.data.message,
      orders: response.data.orders
    });
  }

  async getOrdersByBuyerId(req: Request, res: Response): Promise<void> {
    const buyerId = req.params.buyerId as string;
    const response: AxiosResponse = await this.orderService.buyerOrders(buyerId);
    res.status(response.status).json({
      message: response.data.message,
      orders: response.data.orders
    });
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    const userTo = req.params.userTo as string;
    const response: AxiosResponse = await this.orderService.getNotifications(userTo);
    res.status(response.status).json({
      message: response.data.message,
      notifications: response.data.notifications
    });
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { paymentIntentId, orderData } = req.body;
    const response: AxiosResponse = await this.orderService.cancelOrder(paymentIntentId, orderId as string, orderData);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async requestDeliveryDateExtension(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.orderService.requestDeliveryDateExtension(req.params.orderId as string, req.body);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async updateDeliveryDate(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.orderService.updateDeliveryDate(
      req.params.orderId as string,
      req.params.type as string,
      req.body
    );
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async deliverOrder(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.orderService.deliverOrder(req.params.orderId as string, req.body);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async approveOrder(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.orderService.approveOrder(req.params.orderId as string, req.body);
    res.status(response.status).json({
      message: response.data.message,
      order: response.data.order
    });
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.body;
    const response: AxiosResponse = await this.orderService.markNotificationAsRead(notificationId as string);
    res.status(response.status).json({
      message: response.data.message,
      notification: response.data.notification
    });
  }
}
