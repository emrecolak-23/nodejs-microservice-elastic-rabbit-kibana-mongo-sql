import { inject, injectable, singleton } from 'tsyringe';
import { IConversationModel } from '@chat/models';

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
}
