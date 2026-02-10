import express, { Router } from 'express';
import { MessageController } from '@gateway/controllers';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class MessageRoute {
  private router: Router;

  constructor(private readonly messageController: MessageController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/conversation/:senderUsername/:receiverUsername', this.messageController.getConversation.bind(this.messageController));
    this.router.get('/conversations/:username', this.messageController.getConversationList.bind(this.messageController));
    this.router.get('/:senderUsername/:receiverUsername', this.messageController.getMessages.bind(this.messageController));
    this.router.get('/:conversationId', this.messageController.getUserMessages.bind(this.messageController));
    this.router.post('', this.messageController.addMessage.bind(this.messageController));
    this.router.put('/offer', this.messageController.updateOffer.bind(this.messageController));
    this.router.put('/mark-as-read', this.messageController.markMessageAsRead.bind(this.messageController));
    this.router.put('/mark-multiple-as-read', this.messageController.markMultipleMessagesAsRead.bind(this.messageController));
    return this.router;
  }
}
