import { injectable, singleton } from 'tsyringe';
import { MessageRepository } from '@chat/repositories';
import { IMessageAttributes, IMessageDocument } from '@chat/models';
import { BadRequestError, IMessageDetails, lowerCase, uploads } from '@emrecolak-23/jobber-share';
import { ChatProducer } from '@chat/queues/chat.producer';
import { socketIOChatObject } from '@chat/server';
import crypto from 'crypto';
import { UploadApiResponse } from 'cloudinary';
import { ConversationRepository } from '@chat/repositories/conversation.repository';

@injectable()
@singleton()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly chatProducer: ChatProducer
  ) {}

  async createConversation(conversationId: string, senderUsername: string, receiverUsername: string): Promise<void> {
    const conversation = await this.conversationRepository.createConversation(conversationId, senderUsername, receiverUsername);
    return conversation;
  }

  async addMessage(data: IMessageAttributes): Promise<IMessageDocument> {
    let file: string | undefined = data.file;

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    if (file) {
      const result: UploadApiResponse | undefined = (
        data.fileType === 'zip'
          ? await uploads(file, `${randomCharacters}.zip`)
          : await uploads(file, `${randomCharacters}.${data.fileType}`)
      ) as UploadApiResponse;

      if (!result?.public_id) {
        throw new BadRequestError('File upload failed. Please try again.', 'MessageService addMessage() method error');
      }
      file = result?.secure_url;
      data.file = file;
    }

    const message = await this.messageRepository.addMessage(data);
    if (data.hasOffer) {
      const emailMessageDetails: IMessageDetails = {
        sender: data.senderUsername,
        amount: `${data.offer?.price}`,
        buyerUsername: lowerCase(`${data.receiverUsername}`),
        sellerUsername: lowerCase(`${data.senderUsername}`),
        title: data.offer?.gigTitle,
        description: data.offer?.description,
        deliveryDays: `${data.offer?.deliveryInDays}`,
        template: 'offer'
      };

      await this.chatProducer.publishDirectMessage({
        exchangeName: 'jobber-order-notification',
        routingKey: 'order-email',
        message: JSON.stringify(emailMessageDetails),
        logMessage: 'Offer email message has been sent to notification service'
      });
    }

    socketIOChatObject.emit('message received', message);
    return message;
  }

  async markMessageAsRead(messageId: string): Promise<IMessageDocument> {
    const message: IMessageDocument = await this.messageRepository.markMessageAsRead(messageId);

    if (message) {
      socketIOChatObject.emit('message update', message);
    }

    return message;
  }
}
