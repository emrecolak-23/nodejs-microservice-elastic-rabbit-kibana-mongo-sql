import { injectable, singleton } from 'tsyringe';
import { OrderRepository } from '@order/repositories/order.repository';
import { IOrderMessage, lowerCase, NotFoundError } from '@emrecolak-23/jobber-share';
import { IOrderAttributes } from '@order/models/order.schema';
import { IOrderDocument } from '@emrecolak-23/jobber-share';
import { OrderProducer } from '@order/queues/order.producer';
import { MESSAGE_TYPES, ORDER_QUEUE_CONFIG } from '@order/queues/types/producer.types';
import { EnvConfig } from '@order/config';
import { NotificationService } from './notification.service';
@injectable()
@singleton()
export class OrderService {
  constructor(
    private readonly config: EnvConfig,
    private readonly orderRepository: OrderRepository,
    private readonly orderProducer: OrderProducer,
    private readonly notificationService: NotificationService
  ) {}

  async getOrderById(orderId: string): Promise<IOrderDocument | null> {
    const order: IOrderDocument | undefined = await this.orderRepository.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found', 'OrderService getOrderById() method error');
    }

    return order;
  }

  async getOrdersBySellerId(sellerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = await this.orderRepository.getOrdersBySellerId(sellerId);
    return orders;
  }

  async getOrdersByBuyerId(buyerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = await this.orderRepository.getOrdersByBuyerId(buyerId);
    return orders;
  }

  async createOrder(orderData: IOrderAttributes): Promise<IOrderDocument> {
    const order: IOrderDocument = await this.orderRepository.createOrder(orderData);

    const messageDetails: IOrderMessage = {
      sellerId: orderData.sellerId,
      ongoingJobs: 1,
      type: MESSAGE_TYPES.CREATE_ORDER
    };

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(messageDetails),
      logMessage: 'Order created message sent to user service'
    });

    const emailMessageDetails: IOrderMessage = {
      orderId: order.orderId,
      invoiceId: order.invoiceId,
      orderDue: `${orderData.offer.newDeliveryDate}`,
      amount: `${orderData.price}`,
      buyerUsername: lowerCase(orderData.buyerUsername),
      sellerUsername: lowerCase(orderData.sellerUsername),
      title: orderData.offer.gigTitle,
      description: orderData.offer.description,
      requirements: orderData.requirements,
      serviceFee: `${orderData.serviceFee}`,
      total: `${orderData.price + orderData.serviceFee!}`,
      orderUrl: `${this.config.CLIENT_URL}/order/${order.orderId}/activities`,
      template: 'orderPlaced'
    } as IOrderMessage;

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(emailMessageDetails),
      logMessage: 'Order email message sent to notification service'
    });

    await this.notificationService.sendNotification(order, orderData.sellerUsername, 'Placed an order for your gig');
    return order;
  }
}
