import { injectable, singleton } from 'tsyringe';
import { ClientSession } from 'mongoose';
import { IBuyerAttributes, IBuyerModel, IBuyerDocument } from '@users/models/buyer.schema';

@injectable()
@singleton()
export class BuyerRepository {
  constructor(private readonly buyerModel: IBuyerModel) {}

  async getBuyerByEmail(email: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ email });
  }

  async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ username });
  }

  async getRandomBuyers(count: number): Promise<IBuyerDocument[]> {
    return this.buyerModel.aggregate([{ $sample: { size: count } }]);
  }

  async createBuyer(buyer: IBuyerAttributes, session?: ClientSession): Promise<IBuyerDocument> {
    const newBuyer = this.buyerModel.build(buyer);
    await newBuyer.save({ session });
    return newBuyer;
  }

  async updateBuyerIsSellerProp(email: string, session?: ClientSession): Promise<void> {
    const options = session ? { session } : {};
    await this.buyerModel.updateOne({ email }, { $set: { isSeller: true } }, options).exec();
  }

  async addPurchasedGig(buyerId: string, gigId: string, session?: ClientSession): Promise<void> {
    const options = session ? { session } : {};
    await this.buyerModel.updateOne({ _id: buyerId }, { $push: { purchasedGigs: gigId } }, options).exec();
  }

  async removePurchasedGig(buyerId: string, gigId: string, session?: ClientSession): Promise<void> {
    const options = session ? { session } : {};
    await this.buyerModel.updateOne({ _id: buyerId }, { $pull: { purchasedGigs: gigId } }, options).exec();
  }
}
