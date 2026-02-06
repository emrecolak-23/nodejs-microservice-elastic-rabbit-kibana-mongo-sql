import { injectable, singleton } from 'tsyringe';
import { Model, model } from 'mongoose';
import { IBuyerDocument } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class BuyerRepository {
  constructor(private readonly buyerModel: Model<IBuyerDocument>) {}

  async getBuyerByEmail(email: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ email });
  }

  async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ username });
  }

  async getRandomBuyers(count: number): Promise<IBuyerDocument[]> {
    return this.buyerModel.aggregate([{ $sample: { size: count } }]);
  }

  async createBuyer(buyer: IBuyerDocument): Promise<void> {
    const newBuyer = (this.buyerModel as any).build(buyer);
    await newBuyer.save();
    return newBuyer;
  }

  async updateBuyerIsSellerProp(email: string): Promise<void> {
    await this.buyerModel.updateOne({ email }, { $set: { isSeller: true } }).exec();
  }

  async addPurchasedGig(buyerId: string, gigId: string): Promise<void> {
    await this.buyerModel.updateOne({ _id: buyerId }, { $push: { purchasedGigs: gigId } }).exec();
  }

  async removePurchasedGig(buyerId: string, gigId: string): Promise<void> {
    await this.buyerModel.updateOne({ _id: buyerId }, { $pull: { purchasedGigs: gigId } }).exec();
  }
}
