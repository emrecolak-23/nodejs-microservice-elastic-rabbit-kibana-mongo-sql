import { inject, injectable, singleton } from 'tsyringe';
import { IMessageAttributes, IMessageModel, IMessageDocument } from '@chat/models';

@injectable()
@singleton()
export class MessageRepository {
  constructor(@inject('MessageModel') private readonly messageModel: IMessageModel) {}

  async addMessage(data: IMessageAttributes): Promise<IMessageDocument> {
    const message = this.messageModel.build(data);
    await message.save();
    return message;
  }

  async getUserConversationList(username: string): Promise<IMessageDocument[]> {
    const query = {
      $or: [{ senderUsername: username }, { receiverUsername: username }]
    };

    const messages: IMessageDocument[] = await this.messageModel.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$conversationId',
          result: { $top: { output: '$$ROOT', sortBy: { createdAt: -1 } } }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          sellerId: '$result.sellerId',
          buyerId: '$result.buyerId',
          senderUsername: '$result.senderUsername',
          senderPicture: '$result.senderPicture',
          receiverUsername: '$result.receiverUsername',
          receiverPicture: '$result.receiverPicture',
          body: '$result.body',
          file: '$result.file',
          gigId: '$result.gigId',
          isRead: '$result.isRead',
          hasOffer: '$result.hasOffer',
          createdAt: '$result.createdAt'
        }
      }
    ]);

    return messages;
  }
}
