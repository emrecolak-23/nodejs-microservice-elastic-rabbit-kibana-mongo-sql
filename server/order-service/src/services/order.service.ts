import crypto from 'crypto';

import { injectable, singleton } from 'tsyringe';
import { OrderRepository } from '@order/repositories/order.repository';
import {
  BadRequestError,
  IExtendedDelivery,
  IOrderMessage,
  IReviewMessageDetails,
  lowerCase,
  NotFoundError,
  uploads,
  IOrderDocument
} from '@emrecolak-23/jobber-share';
import { IDeliveredWork, IOrderAttributes } from '@order/models/order.schema';
import { OrderProducer } from '@order/queues/order.producer';
import { MESSAGE_TYPES, ORDER_QUEUE_CONFIG } from '@order/queues/types/producer.types';
import { EnvConfig } from '@order/config';
import { UploadApiResponse } from 'cloudinary';
import { socketIOOrderObject } from '@order/server';

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

    this.notificationService.sendNotification(order, orderData.sellerUsername, 'Placed an order for your gig');
    return order;
  }

  async cancelOrder(orderId: string, data: IOrderMessage): Promise<IOrderDocument> {
    const order = await this.orderRepository.cancelOrder(orderId);

    // update seller info
    const messageDetails: IOrderMessage = {
      sellerId: order.sellerId,
      type: MESSAGE_TYPES.CANCEL_ORDER
    };

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(messageDetails),
      logMessage: 'Order cancelled message sent to user service'
    });

    // update buyer info
    const buyerMessageDetails: IOrderMessage = {
      orderId: order.orderId,
      type: MESSAGE_TYPES.CANCEL_ORDER,
      buyerId: order.buyerId,
      purchasedGigs: data.purchasedGigs
    };

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.BUYER_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.BUYER_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(buyerMessageDetails),
      logMessage: 'Order cancelled message sent to user service'
    });

    this.notificationService.sendNotification(order, order.sellerUsername, 'Cancelled an order for your gig');

    return order;
  }

  async approveOrder(orderId: string, data: IOrderMessage): Promise<IOrderDocument> {
    const approvedOrder = await this.orderRepository.approveOrder(orderId);

    // update seller info
    const messageDetails: IOrderMessage = {
      sellerId: data.sellerId,
      type: MESSAGE_TYPES.APPROVE_ORDER,
      buyerId: data.buyerId,
      ongoingJobs: data.ongoingJobs,
      completedJobs: data.completedJobs,
      totalEarnings: data.totalEarnings,
      recentDelivery: data.recentDelivery
    } as IOrderMessage;

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.SELLER_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(messageDetails),
      logMessage: 'Order approved message sent to user service'
    });

    // update buyer info
    const buyerMessageDetails: IOrderMessage = {
      type: MESSAGE_TYPES.PURCHASED_GIGS,
      buyerId: approvedOrder.buyerId,
      purchasedGigs: approvedOrder.gigId
    } as IOrderMessage;

    await this.orderProducer.publishDirectMessage({
      exchangeName: ORDER_QUEUE_CONFIG.BUYER_QUEUE_CONFIG.exchangeName,
      routingKey: ORDER_QUEUE_CONFIG.BUYER_QUEUE_CONFIG.routingKey,
      message: JSON.stringify(buyerMessageDetails),
      logMessage: 'Order approved message sent to user service'
    });

    this.notificationService.sendNotification(approvedOrder, approvedOrder.sellerUsername, 'Approved an order for your gig');

    return approvedOrder;
  }

  async uploadOrderFile(file: string, fileType: string): Promise<string> {
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const result: UploadApiResponse | undefined =
      fileType === 'zip'
        ? ((await uploads(file, `${randomCharacters}.zip`)) as UploadApiResponse)
        : ((await uploads(file, `${randomCharacters}.${fileType}`)) as UploadApiResponse);
    if (!result?.public_id) {
      throw new BadRequestError('File upload failed. Please try again.', 'OrderService uploadOrderFile() method error');
    }
    return result.secure_url;
  }

  async deliverOrder(orderId: string, delivered: boolean, deliveredWork: IDeliveredWork): Promise<IOrderDocument> {
    const deliveredOrder = await this.orderRepository.deliverOrder(orderId, delivered, deliveredWork);

    if (deliveredOrder) {
      const messageDetails: IOrderMessage = {
        orderId: deliveredOrder.orderId,
        buyerUsername: lowerCase(deliveredOrder.buyerUsername),
        sellerUsername: lowerCase(deliveredOrder.sellerUsername),
        title: deliveredOrder.offer.gigTitle,
        description: deliveredOrder.offer.description,
        orderUrl: `${this.config.CLIENT_URL}/orders/${deliveredOrder.orderId}/activities`,
        template: 'orderDelivered'
      };

      await this.orderProducer.publishDirectMessage({
        exchangeName: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.exchangeName,
        routingKey: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.routingKey,
        message: JSON.stringify(messageDetails),
        logMessage: 'Order delivered message sent to notification service'
      });

      this.notificationService.sendNotification(deliveredOrder, deliveredOrder.buyerUsername, 'Delivered an order for your gig');
    }

    return deliveredOrder;
  }

  async requestDeliverExtension(orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> {
    const orderWithExtension = await this.orderRepository.requestDeliverExtension(orderId, data);

    if (orderWithExtension) {
      const messageDetails: IOrderMessage = {
        orderId: orderWithExtension.orderId,
        buyerUsername: lowerCase(orderWithExtension.buyerUsername),
        sellerUsername: lowerCase(orderWithExtension.sellerUsername),
        originalDate: orderWithExtension.offer.oldDeliveryDate,
        newDate: orderWithExtension.offer.newDeliveryDate,
        reason: orderWithExtension.offer.reason,
        orderUrl: `${this.config.CLIENT_URL}/orders/${orderWithExtension.orderId}/activities`,
        template: 'orderExtension'
      };

      await this.orderProducer.publishDirectMessage({
        exchangeName: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.exchangeName,
        routingKey: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.routingKey,
        message: JSON.stringify(messageDetails),
        logMessage: 'Order extension requested message sent to notification service'
      });

      this.notificationService.sendNotification(
        orderWithExtension,
        orderWithExtension.buyerUsername,
        'Requested an order delivery extension'
      );
    }

    return orderWithExtension;
  }

  async approveDeliveryExtension(orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> {
    const approvedExtension = await this.orderRepository.approveDeliveryExtension(orderId, data);

    if (approvedExtension) {
      const messageDetails: IOrderMessage = {
        subject: 'Congratulations! Your order delivery extension request was approved',
        buyerUsername: lowerCase(approvedExtension.buyerUsername),
        sellerUsername: lowerCase(approvedExtension.sellerUsername),
        header: 'Request Accepted',
        type: 'accepted',
        message: 'You can continue working on the order',
        orderUrl: `${this.config.CLIENT_URL}/orders/${approvedExtension.orderId}/activities`,
        template: 'orderExtensionApproval'
      };

      await this.orderProducer.publishDirectMessage({
        exchangeName: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.exchangeName,
        routingKey: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.routingKey,
        message: JSON.stringify(messageDetails),
        logMessage: 'Order extension approved message sent to notification service'
      });

      this.notificationService.sendNotification(
        approvedExtension,
        approvedExtension.sellerUsername,
        'Approved your order delivery date extension'
      );
    }

    return approvedExtension;
  }

  async rejectDeliveryExtension(orderId: string): Promise<IOrderDocument> {
    const rejectedExtension = await this.orderRepository.rejectDeliveryExtension(orderId);

    if (rejectedExtension) {
      const messageDetails: IOrderMessage = {
        subject: 'Sorry! Your order delivery extension request was rejected',
        buyerUsername: lowerCase(rejectedExtension.buyerUsername),
        sellerUsername: lowerCase(rejectedExtension.sellerUsername),
        header: 'Request Rejected',
        type: 'rejected',
        message: 'You can contact the buyer for more information',
        orderUrl: `${this.config.CLIENT_URL}/orders/${rejectedExtension.orderId}/activities`,
        template: 'orderExtensionApproval'
      };

      await this.orderProducer.publishDirectMessage({
        exchangeName: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.exchangeName,
        routingKey: ORDER_QUEUE_CONFIG.NOTIFICATION_QUEUE_CONFIG.routingKey,
        message: JSON.stringify(messageDetails),
        logMessage: 'Order extension rejected message sent to notification service'
      });

      this.notificationService.sendNotification(
        rejectedExtension,
        rejectedExtension.sellerUsername,
        'Rejected your order delivery extension'
      );
    }

    return rejectedExtension;
  }

  async updateOrderReview(data: IReviewMessageDetails): Promise<IOrderDocument> {
    const updatedOrderReview = await this.orderRepository.updateOrderReview(data);

    if (updatedOrderReview) {
      this.notificationService.sendNotification(
        updatedOrderReview,
        data.type === 'buyer-review' ? updatedOrderReview.sellerUsername : updatedOrderReview.buyerUsername,
        `Left your a ${data.rating} star review`
      );
    }
    return updatedOrderReview;
  }

  async sendSocketNotification(orderId: string): Promise<void> {
    const order: IOrderDocument | undefined = await this.orderRepository.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found', 'OrderService sendSocketNotification() method error');
    }

    socketIOOrderObject.emit('order notification', order);
  }
}
