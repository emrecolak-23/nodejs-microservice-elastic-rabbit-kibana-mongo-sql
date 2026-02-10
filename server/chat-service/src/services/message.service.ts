import { injectable, singleton } from 'tsyringe';
import { MessageRepository } from '@chat/repositories';
import { IMessageAttributes, IMessageDocument } from '@chat/models';
import { IMessageDetails, lowerCase } from '@emrecolak-23/jobber-share';
import { ChatProducer } from '@chat/queues/chat.producer';
import { socketIOChatObject } from '@chat/server';

@injectable()
@singleton()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatProducer: ChatProducer
  ) {}

  async addMessage(data: IMessageAttributes): Promise<IMessageDocument> {
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
}
