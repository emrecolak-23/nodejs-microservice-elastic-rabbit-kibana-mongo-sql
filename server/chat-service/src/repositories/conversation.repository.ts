import { inject, injectable, singleton } from 'tsyringe';
import { IConversationDocument, IConversationModel } from '@chat/models';

@injectable()
@singleton()
export class ConversationRepository {
  constructor(@inject('ConversationModel') private readonly conversationModel: IConversationModel) {}

  async createConversation(conversationId: string, senderUsername: string, receiverUsername: string): Promise<void> {
    const conversation = this.conversationModel.build({
      conversationId,
      senderUsername,
      receiverUsername
    });

    await conversation.save();
  }

  async getConversation(sender: string, receiver: string): Promise<IConversationDocument[]> {
    const query = {
      $or: [
        { senderUsername: sender, receiverUsername: receiver },
        { senderUsername: receiver, receiverUsername: sender }
      ]
    };

    const conversation: IConversationDocument[] = await this.conversationModel.aggregate([
      {
        $match: query
      }
    ]);

    return conversation;
  }
}
