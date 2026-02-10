import express, { Router } from 'express';
import { MessageController } from '@chat/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class MessageRoute {
  private router: Router;

  constructor(private readonly messageController: MessageController) {
    this.router = express.Router();
  }

  public routes(): Router {
    return this.router;
  }
}
