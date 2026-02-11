import express, { Router } from 'express';
import { NotificationController } from '@order/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class NotificationRoute {
  private router: Router;

  constructor(private readonly notificationController: NotificationController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/notification/:userTo', this.notificationController.getNotifications.bind(this.notificationController));
    this.router.put('/notification/mark-as-read', this.notificationController.markNotificationAsRead.bind(this.notificationController));
    return this.router;
  }
}
