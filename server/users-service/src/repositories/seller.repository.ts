import { injectable, singleton } from 'tsyringe';
import { Types, ClientSession } from 'mongoose';
import { ISellerAttributes, ISellerDocument, ISellerModel } from '@users/models/seller.schema';

@injectable()
@singleton()
export class SellerRepository {
  constructor(private readonly sellerModel: ISellerModel) {}

  async getSellerById(sellerId: string): Promise<ISellerDocument | null> {
    return this.sellerModel.findById(new Types.ObjectId(sellerId)).exec() as Promise<ISellerDocument | null>;
  }

  async getSellerByUsername(username: string): Promise<ISellerDocument | null> {
    return this.sellerModel.findOne({ username }).exec() as Promise<ISellerDocument | null>;
  }

  async getSellerByEmail(email: string): Promise<ISellerDocument | null> {
    return this.sellerModel.findOne({ email }).exec() as Promise<ISellerDocument | null>;
  }

  async getRandomSellers(count: number): Promise<ISellerDocument[]> {
    return this.sellerModel.aggregate([{ $sample: { size: count } }]).exec() as Promise<ISellerDocument[]>;
  }

  async createSeller(seller: ISellerAttributes, session?: ClientSession): Promise<ISellerDocument> {
    const newSeller = this.sellerModel.build(seller);
    await newSeller.save({ session });
    return newSeller;
  }
}
