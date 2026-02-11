import { injectable, singleton, inject } from 'tsyringe';
import { IOrderAttributes, IOrderModel } from '@order/models/order.schema';
import { IOrderDocument } from '@emrecolak-23/jobber-share';

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
}
