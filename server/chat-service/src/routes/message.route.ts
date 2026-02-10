import express, { Router } from 'express';
import { MessageController } from '@chat/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@chat/middlewares';
import { messageSchema, updateOfferSchema, markSingleMessageSchema, markMultipleMessagesSchema } from '@chat/schemes/message';

@singleton()
@injectable()
export class MessageRoute {
  private router: Router;

  constructor(
    private readonly messageController: MessageController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/conversation/:senderUsername/:receiverUsername', this.messageController.getConversation.bind(this.messageController));
    this.router.get('/conversations/:username', this.messageController.getUserConversationList.bind(this.messageController));
    this.router.get('/:senderUsername/:receiverUsername', this.messageController.getMessages.bind(this.messageController));
    this.router.get('/:conversationId', this.messageController.getMessagesByConversationId.bind(this.messageController));
    this.router.post(
      '/',
      this.validateMiddleware.validate(messageSchema),
      this.messageController.createMessage.bind(this.messageController)
    );
    this.router.put(
      '/offer',
      this.validateMiddleware.validate(updateOfferSchema),
      this.messageController.updateOffer.bind(this.messageController)
    );
    this.router.put(
      '/mark-as-read',
      this.validateMiddleware.validate(markSingleMessageSchema),
      this.messageController.markSingleMessage.bind(this.messageController)
    );
    this.router.put(
      '/mark-multiple-as-read',
      this.validateMiddleware.validate(markMultipleMessagesSchema),
      this.messageController.markMultipleMessages.bind(this.messageController)
    );

    return this.router;
  }
}
