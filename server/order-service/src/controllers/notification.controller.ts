import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { NotificationService } from '@order/services/notification.service';
import { INotificationDocument } from '@order/models/notification.schema';
import { StatusCodes } from 'http-status-codes';
import { OrderService } from '@order/services/order.service';

@injectable()
@singleton()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly orderService: OrderService
  ) {}

  async getNotifications(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] = await this.notificationService.getNotificationByUserTo(req.params.userTo as string);

    res.status(StatusCodes.OK).json({
      message: 'Notifications retrieved successfully',
      notifications
    });
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    const notification: INotificationDocument = await this.notificationService.markNotificationAsRead(req.params.notificationId as string);

    await this.orderService.sendSocketNotification(notification.orderId);

    res.status(StatusCodes.OK).json({
      message: 'Notification marked as read successfully',
      notification
    });
  }
}
