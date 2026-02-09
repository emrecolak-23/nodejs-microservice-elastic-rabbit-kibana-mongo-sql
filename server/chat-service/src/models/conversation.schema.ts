import { Schema, model, Model, Document, Types } from 'mongoose';

interface IConversationAttributes {
  conversationId: string;
  senderUsername: string;
  receiverUsername: string;
}

export interface IConversationDocument extends Document, IConversationAttributes {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationModel extends Model<IConversationDocument> {
  build(attrs: IConversationAttributes): IConversationDocument;
}

const conversationSchema = new Schema<IConversationDocument, IConversationModel>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    senderUsername: { type: String, required: true },
    receiverUsername: { type: String, required: true }
  },
  { timestamps: true }
);

conversationSchema.statics.build = (attrs: IConversationAttributes): IConversationDocument => {
  return new ConversationModel(attrs);
};

export const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>('Conversation', conversationSchema);

export default ConversationModel;
