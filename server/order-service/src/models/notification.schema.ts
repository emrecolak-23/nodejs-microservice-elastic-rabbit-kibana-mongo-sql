import { Document, Model, Schema, Types, model } from 'mongoose';

export interface INotificationAttributes {
  userTo: string;
  senderUsername: string;
  senderPicture: string;
  receiverUsername: string;
  receiverPicture: string;
  isRead: boolean;
  message: string;
  orderId: string;
}

export interface INotificationDocument extends Document, INotificationAttributes {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationModel extends Model<INotificationDocument> {
  build(attrs: INotificationAttributes): INotificationDocument;
}

const notificationSchema = new Schema<INotificationDocument, INotificationModel>(
  {
    userTo: {
      type: String,
      default: '',
      index: true
    },
    senderUsername: {
      type: String,
      default: ''
    },
    senderPicture: {
      type: String,
      default: ''
    },
    receiverUsername: {
      type: String,
      default: ''
    },
    receiverPicture: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    orderId: {
      type: String,
      default: ''
    }
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.statics.build = (attrs: INotificationAttributes): INotificationDocument => {
  return new NotificationModel(attrs);
};

export const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema);
