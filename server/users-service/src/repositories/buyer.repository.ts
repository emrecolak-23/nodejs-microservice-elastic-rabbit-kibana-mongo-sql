import { injectable, singleton, inject } from 'tsyringe';
import { ClientSession } from 'mongoose';
import { IBuyerAttributes, IBuyerModel, IBuyerDocument } from '@users/models/buyer.schema';
import { BuyerBuilder } from '@users/builders/buyer.builder';

@injectable()
@singleton()
export class BuyerRepository {
  constructor(
    @inject('BuyerModel') private readonly buyerModel: IBuyerModel,
    private readonly buyerBuilder: BuyerBuilder
  ) {}

  async getBuyerByEmail(email: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ email }).lean() as Promise<IBuyerDocument | null>;
  }

  async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
    return this.buyerModel.findOne({ username }).lean() as Promise<IBuyerDocument | null>;
  }

  async getRandomBuyers(count: number): Promise<IBuyerDocument[]> {
    return this.buyerModel.aggregate([{ $sample: { size: count } }]);
  }

  async createBuyer(buyer: IBuyerAttributes, session?: ClientSession): Promise<IBuyerDocument> {
    const newBuyer: IBuyerDocument = this.buyerBuilder
      .withUsername(buyer.username)
      .withEmail(buyer.email)
      .withProfilePicture(buyer.profilePicture)
      .withCountry(buyer.country)
      .withPurchasedGigs(buyer.purchasedGigs)
      .build();
    await newBuyer.save({ session });
    return newBuyer;
  }

  async updateBuyerIsSellerProp(email: string, session?: ClientSession): Promise<void> {
    const options = session ? { session } : {};
    await this.buyerModel.updateOne({ email }, { $set: { isSeller: true } }, options).exec();
  }

  updateBuyerPurchasedGigsProp = async (buyerId: string, purchasedGigId: string, type: string): Promise<void> => {
    await this.buyerModel
      .updateOne(
        { _id: buyerId },
        type === 'purchased-gigs'
          ? {
              $push: {
                purchasedGigs: purchasedGigId
              }
            }
          : {
              $pull: {
                purchasedGigs: purchasedGigId
              }
            }
      )
      .exec();
  };
}
