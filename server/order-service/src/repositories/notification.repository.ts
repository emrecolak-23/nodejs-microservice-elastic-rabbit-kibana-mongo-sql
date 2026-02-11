import { INotificationAttributes, INotificationDocument, INotificationModel } from '@order/models/notification.schema';
import { injectable, singleton, inject } from 'tsyringe';
import { Types } from 'mongoose';

@injectable()
@singleton()
export class NotficationRepository {
  constructor(@inject('NotificationModel') private readonly notificationModel: INotificationModel) {}

  async createNotification(notification: INotificationAttributes): Promise<INotificationDocument> {
    const newNotification = this.notificationModel.build(notification);
    await newNotification.save();
    return newNotification;
  }

  async getNotificationById(notificationId: string): Promise<INotificationDocument | null> {
    const notification = await this.notificationModel.findById(notificationId);
    return notification;
  }

  async getNotificationsByUserTo(userTo: string): Promise<INotificationDocument[]> {
    const notifications = await this.notificationModel.aggregate([{ $match: { userTo } }]);
    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<INotificationDocument> {
    const updatedNotification = (await this.notificationModel
      .findOneAndUpdate({ _id: new Types.ObjectId(notificationId) }, { $set: { isRead: true } }, { new: true })
      .exec()) as INotificationDocument;
    return updatedNotification;
  }
}
