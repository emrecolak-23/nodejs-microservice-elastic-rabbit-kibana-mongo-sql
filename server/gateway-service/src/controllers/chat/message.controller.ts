import { singleton, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { MessageService } from '@gateway/services/api/message.service';

@singleton()
@injectable()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  async getConversation(req: Request, res: Response): Promise<void> {
    const { senderUsername, receiverUsername } = req.params;
    const response: AxiosResponse = await this.messageService.getConversation(senderUsername as string, receiverUsername as string);
    res.status(response.status).json({
      message: response.data.message,
      conversations: response.data.conversations
    });
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    const { senderUsername, receiverUsername } = req.params;
    const response: AxiosResponse = await this.messageService.getMessages(senderUsername as string, receiverUsername as string);
    res.status(response.status).json({
      message: response.data.message,
      messages: response.data.messages
    });
  }

  async getConversationList(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const response: AxiosResponse = await this.messageService.getConversationList(username as string);
    res.status(response.status).json({
      message: response.data.message,
      messages: response.data.messages
    });
  }

  async getUserMessages(req: Request, res: Response): Promise<void> {
    const { conversationId } = req.params;
    const response: AxiosResponse = await this.messageService.getUserMessages(conversationId as string);
    res.status(response.status).json({
      message: response.data.message,
      messages: response.data.messages
    });
  }

  async addMessage(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.messageService.addMessage(req.body);
    res.status(response.status).json({
      message: response.data.message,
      conversationId: response.data.conversationId
    });
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    const { messageId, type } = req.body;
    const response: AxiosResponse = await this.messageService.updateOffer(messageId as string, type as string);
    res.status(response.status).json({
      message: response.data.message,
      singleMessage: response.data.singleMessage
    });
  }

  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    const { messageId } = req.body;
    const response: AxiosResponse = await this.messageService.markMessageAsRead(messageId as string);
    res.status(response.status).json({
      message: response.data.message,
      singleMessage: response.data.singleMessage
    });
  }

  async markMultipleMessagesAsRead(req: Request, res: Response): Promise<void> {
    const { receiverUsername, senderUsername, messageId } = req.body;
    const response: AxiosResponse = await this.messageService.markMultipleMessagesAsRead(
      receiverUsername as string,
      senderUsername as string,
      messageId as string
    );
    res.status(response.status).json({
      message: response.data.message
    });
  }
}
