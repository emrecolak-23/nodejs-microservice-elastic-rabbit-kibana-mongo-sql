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
}
