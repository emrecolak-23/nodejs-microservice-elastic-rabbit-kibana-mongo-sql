import { injectable, singleton, inject } from 'tsyringe';
import { IDeliveredWork, IOrderAttributes, IOrderModel } from '@order/models/order.schema';
import { IOrderDocument, IExtendedDelivery, IReviewMessageDetails } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class OrderRepository {
  constructor(@inject('OrderModel') private readonly orderModel: IOrderModel) {}

  async getOrderById(orderId: string): Promise<IOrderDocument | undefined> {
    const orders: IOrderDocument[] = await this.orderModel.aggregate([{ $match: { orderId } }]).exec();
    return orders[0];
  }

  async getOrdersBySellerId(sellerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = await this.orderModel.aggregate([{ $match: { sellerId } }]).exec();
    return orders;
  }

  async getOrdersByBuyerId(buyerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = await this.orderModel.aggregate([{ $match: { buyerId } }]).exec();
    return orders;
  }

  async createOrder(order: IOrderAttributes): Promise<IOrderDocument> {
    const newOrder = this.orderModel.build(order);
    await newOrder.save();
    return newOrder.toJSON() as IOrderDocument;
  }

  async cancelOrder(orderId: string): Promise<IOrderDocument> {
    const order = await this.orderModel
      .findOneAndUpdate({ orderId }, { $set: { cancelled: true, status: 'Cancelled', approvedAt: new Date() } }, { new: true })
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async approveOrder(orderId: string): Promise<IOrderDocument> {
    const order = await this.orderModel
      .findOneAndUpdate({ orderId }, { $set: { approved: true, status: 'Completed', approvedAt: new Date() } }, { new: true })
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async deliverOrder(orderId: string, delivered: boolean, deliveredWork: IDeliveredWork): Promise<IOrderDocument> {
    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId },
        {
          $set: { delivered, deliveredWork, status: 'Delivered', ['events.orderDelivered']: new Date() },
          $push: { deliveredWork }
        },
        { new: true }
      )
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async requestDeliverExtension(orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> {
    const { newDate, days, reason, originalDate } = data;

    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId },
        {
          $set: {
            ['requestDeliverExtension.originalDate']: originalDate,
            ['requestDeliverExtension.newDate']: newDate,
            ['requestDeliverExtension.days']: days,
            ['requestDeliverExtension.reason']: reason
          }
        },
        { new: true }
      )
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async approveDeliveryExtension(orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> {
    const { newDate, days, reason, deliveryDateUpdate } = data;

    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId },
        {
          $set: {
            ['offer.deliveryInDays']: days,
            ['offer.newDeliveryDate']: newDate,
            ['offer.reason']: reason,
            ['events.deliveryDateUpdate']: new Date(`${deliveryDateUpdate}`),
            requestExtension: {
              originalDate: '',
              newDate: '',
              days: 0,
              reason: ''
            }
          }
        },
        { new: true }
      )
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async rejectDeliveryExtension(orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> {
    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId },
        {
          $set: {
            requestExtension: {
              originalDate: '',
              newDate: '',
              days: 0,
              reason: ''
            }
          }
        },
        { new: true }
      )
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }

  async updateOrderReview(data: IReviewMessageDetails): Promise<IOrderDocument> {
    const { review, rating } = data;

    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId: data.orderId },
        {
          $set:
            data.type === 'buyer-review'
              ? {
                  buyerReview: {
                    review,
                    rating,
                    date: new Date(`${data.createdAt}`)
                  },
                  ['events.buyerReview']: new Date(`${data.createdAt}`)
                }
              : {
                  sellerReview: {
                    review,
                    rating,
                    date: new Date(`${data.createdAt}`)
                  },
                  ['events.sellerReview']: new Date(`${data.createdAt}`)
                }
        },
        { new: true }
      )
      .lean<IOrderDocument>()
      .exec();
    return order as IOrderDocument;
  }
}
