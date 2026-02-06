import { Schema, Model, model, Types, Document } from 'mongoose';

export interface IBuyerAttributes {
  username: string;
  email: string;
  profilePicture: string;
  country: string;
  isSeller: boolean;
  purchasedGigs: string[];
}

export interface IBuyerModel extends Model<IBuyerDocument> {
  build(attrs: IBuyerAttributes): IBuyerDocument;
}

export interface IBuyerDocument extends Document, IBuyerAttributes {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const buyerSchema = new Schema<IBuyerDocument, IBuyerModel>(
  {
    username: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      index: true
    },
    profilePicture: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    isSeller: {
      type: Boolean,
      default: false
    },
    purchasedGigs: [{ type: Schema.Types.ObjectId, ref: 'Gig' }]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

buyerSchema.statics.build = (attrs: IBuyerAttributes): IBuyerDocument => {
  return new BuyerModel(attrs);
};

export const BuyerModel: Model<IBuyerDocument> = model<IBuyerDocument>('Buyer', buyerSchema);
