import { Schema, model, Model, Document, Types } from 'mongoose';

export interface IMessageAttributes {
  conversationId: string;
  senderUsername: string;
  receiverUsername: string;
  senderPicture: string;
  receiverPicture: string;
  buyerId: string;
  sellerId: string;
  body?: string;
  file?: string;
  fileType?: string;
  fileSize?: string;
  fileName?: string;
  gigId?: string;
  isRead?: boolean;
  hasOffer?: boolean;
  offer?: {
    gigTitle: string;
    price: number;
    description: string;
    deliveryInDays: number;
    oldDeliveryDate: string;
    newDeliveryDate: string;
    accepted: boolean;
    cancelled: boolean;
    reason: string;
  };
}

export interface IMessageDocument extends Document, IMessageAttributes {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageModel extends Model<IMessageDocument> {
  build(attrs: IMessageAttributes): IMessageDocument;
}

const messageSchema = new Schema<IMessageDocument, IMessageModel>(
  {
    conversationId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true, index: true },
    receiverUsername: { type: String, required: true, index: true },
    senderPicture: { type: String, required: true },
    receiverPicture: { type: String, required: true },
    body: { type: String, default: '' },
    file: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileName: { type: String, default: '' },
    gigId: { type: String, default: '' },
    buyerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    hasOffer: { type: Boolean, default: false },
    offer: {
      gigTitle: { type: String, default: '' },
      price: { type: Number, default: 0 },
      description: { type: String, default: '' },
      deliveryInDays: { type: Number, default: 0 },
      oldDeliveryDate: { type: String, default: '' },
      newDeliveryDate: { type: String, default: '' },
      accepted: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false }
    }
  },
  { timestamps: true, versionKey: false }
);

messageSchema.statics.build = (attrs: IMessageAttributes): IMessageDocument => {
  return new MessageModel(attrs);
};

export const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema);

export default MessageModel;
