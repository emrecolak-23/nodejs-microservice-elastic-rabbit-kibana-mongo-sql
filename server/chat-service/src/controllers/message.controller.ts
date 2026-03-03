import { MessageService } from '@chat/services';
import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { IConversationDocument, IMessageAttributes, IMessageDocument } from '@chat/models';

@singleton()
@injectable()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  async createMessage(req: Request, res: Response): Promise<void> {
    const { hasConversationId } = req.body;

    if (!hasConversationId) {
      const { conversationId, senderUsername, receiverUsername } = req.body;
      await this.messageService.createConversation(conversationId, senderUsername, receiverUsername);
    }

    const messageData: IMessageAttributes = {
      conversationId: req.body.conversationId,
      senderUsername: req.body.senderUsername,
      receiverUsername: req.body.receiverUsername,
      senderPicture: req.body.senderPicture,
      receiverPicture: req.body.receiverPicture,
      buyerId: req.body.buyerId,
      sellerId: req.body.sellerId,
      body: req.body.body,
      file: req.body.file,
      fileType: req.body.fileType,
      fileSize: req.body.fileSize,
      fileName: req.body.fileName,
      gigId: req.body.gigId,
      isRead: req.body.isRead,
      hasOffer: req.body.hasOffer,
      offer: req.body.offer
    };

    await this.messageService.addMessage(messageData);
    res.status(StatusCodes.CREATED).json({
      message: 'Message created successfully',
      conversationId: messageData.conversationId
    });
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    const { messageId, type } = req.body;
    const message: IMessageDocument = await this.messageService.updateOffer(messageId, type);

    res.status(StatusCodes.OK).json({
      message: 'Offer updated successfully',
      singleMessage: message
    });
  }

  async markMultipleMessages(req: Request, res: Response): Promise<void> {
    const { messageId, receiverUsername, senderUsername } = req.body;

    await this.messageService.markManyMessageAsRead(receiverUsername, senderUsername, messageId);

    res.status(StatusCodes.OK).json({
      message: 'Messages marked as read successfully'
    });
  }

  async markSingleMessage(req: Request, res: Response): Promise<void> {
    const { messageId } = req.body;
    const message: IMessageDocument = await this.messageService.markSingleMessage(messageId);

    res.status(StatusCodes.OK).json({
      message: 'Message marked as read successfully',
      singleMessage: message
    });
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    const { senderUsername, receiverUsername } = req.params;
    const conversations: IConversationDocument[] = await this.messageService.getConversation(
      senderUsername as string,
      receiverUsername as string
    );

    res.status(StatusCodes.OK).json({
      message: 'Chat conversation',
      conversations
    });
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    const { senderUsername, receiverUsername } = req.params;
    const messages: IMessageDocument[] = await this.messageService.getMessages(senderUsername as string, receiverUsername as string);

    res.status(StatusCodes.OK).json({
      message: 'Chat messages',
      messages
    });
  }

  async getUserConversationList(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const messages: IMessageDocument[] = await this.messageService.getUserConversationList(username as string);
    res.status(StatusCodes.OK).json({
      message: 'User conversation list',
      messages
    });
  }

  async getMessagesByConversationId(req: Request, res: Response): Promise<void> {
    const { conversationId } = req.params;
    const messages: IMessageDocument[] = await this.messageService.getMessagesByConversationId(conversationId as string);
    res.status(StatusCodes.OK).json({
      message: 'Conversation messages',
      messages
    });
  }
}
