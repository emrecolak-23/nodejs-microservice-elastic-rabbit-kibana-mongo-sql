import { injectable, singleton } from 'tsyringe';
import { NotficationRepository } from '@order/repositories/notification.repository';
import { INotificationDocument, INotificationAttributes } from '@order/models/notification.schema';
import { IOrderDocument, IOrderNotifcation, NotFoundError } from '@emrecolak-23/jobber-share';
import { socketIOOrderObject } from '@order/server';

@injectable()
@singleton()
export class NotificationService {
  constructor(private readonly notificationRepository: NotficationRepository) {}

  async createNotification(notification: INotificationAttributes): Promise<INotificationDocument> {
    const newNotification: INotificationDocument = await this.notificationRepository.createNotification(notification);
    return newNotification;
  }

  async getNotificationByUserTo(userToId: string): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] = await this.notificationRepository.getNotificationsByUserTo(userToId);

    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<INotificationDocument> {
    const updatedNotification: INotificationDocument = await this.notificationRepository.markNotificationAsRead(notificationId);

    if (!updatedNotification) {
      throw new NotFoundError('Notification not found', 'NotificationService markNotificationAsRead() method error');
    }

    return updatedNotification;
  }

  async sendNotification(data: IOrderDocument, userToId: string, message: string): Promise<void> {
    const notification: INotificationAttributes = {
      userTo: userToId,
      senderUsername: data.sellerUsername,
      senderPicture: data.sellerImage,
      receiverUsername: data.buyerUsername,
      receiverPicture: data.buyerImage,
      message,
      orderId: data.orderId
    } as INotificationAttributes;

    const orderNotification: INotificationDocument = await this.createNotification(notification);

    socketIOOrderObject.emit('orderNotification', data, orderNotification);
  }
}
