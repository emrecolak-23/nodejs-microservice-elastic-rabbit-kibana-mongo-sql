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

  async getMessages(sender: string, receiver: string): Promise<IMessageDocument[]> {
    const query = {
      $or: [
        { senderUsername: sender, receiverUsername: receiver },
        { senderUsername: receiver, receiverUsername: sender }
      ]
    };

    const messages: IMessageDocument[] = await this.messageModel.aggregate([
      {
        $match: query
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    return messages;
  }

  async getUserMessages(messageConversationId: string): Promise<IMessageDocument[]> {
    const messages: IMessageDocument[] = await this.messageModel.aggregate([
      {
        $match: { conversationId: messageConversationId }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    return messages;
  }

  async updateOffer(messageId: string, type: string): Promise<IMessageDocument | null> {
    const message: IMessageDocument | null = (await this.messageModel.findOneAndUpdate(
      {
        _id: messageId
      },
      {
        $set: {
          [`offer.${type}`]: true
        }
      },
      { new: true }
    )) as IMessageDocument;

    return message;
  }

  async markMessageAsRead(messageId: string): Promise<IMessageDocument> {
    const message: IMessageDocument | null = (await this.messageModel.findOneAndUpdate(
      {
        _id: messageId
      },
      {
        $set: { isRead: true }
      },
      { new: true }
    )) as IMessageDocument;

    return message;
  }

  async markManyMessageAsRead(receiver: string, sender: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderUsername: sender,
        receiverUsername: receiver,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );
  }

  async getMessageById(messageId: string): Promise<IMessageDocument | null> {
    const message: IMessageDocument | null = await this.messageModel.findById(messageId);
    return message;
  }
}
