import { injectable, singleton } from 'tsyringe';
import { Types, ClientSession } from 'mongoose';
import { ISellerAttributes, ISellerDocument, ISellerModel } from '@users/models/seller.schema';
import { IOrderMessage, IRatingTypes, IReviewMessageDetails } from '@emrecolak-23/jobber-share';

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

  async updateSeller(sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument> {
    return this.sellerModel
      .findByIdAndUpdate(
        sellerId,
        {
          $set: {
            profilePublicId: sellerData.profilePublicId,
            fullName: sellerData.fullName,
            email: sellerData.email,
            profilePicture: sellerData.profilePicture,
            description: sellerData.description,
            country: sellerData.country,
            oneline: sellerData.oneline,
            skills: sellerData.skills,
            languages: sellerData.languages,
            responseTime: sellerData.responseTime,
            experience: sellerData.experience,
            education: sellerData.education,
            socialLinks: sellerData.socialLinks
          }
        },
        { new: true }
      )
      .exec() as Promise<ISellerDocument>;
  }

  async incrementSellerNumericField(
    sellerId: string,
    field: 'totalGigs' | 'ongoingJobs',
    value: number,
    session?: ClientSession
  ): Promise<ISellerDocument> {
    const options = session ? { new: true, session } : { new: true };
    return this.sellerModel.findByIdAndUpdate(sellerId, { $inc: { [field]: value } }, options).exec() as Promise<ISellerDocument>;
  }

  async updateSellerCompletedJobsCount(data: IOrderMessage, session?: ClientSession): Promise<ISellerDocument> {
    const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;

    const options = session ? { new: true, session } : { new: true };
    return this.sellerModel
      .findByIdAndUpdate(
        sellerId,
        {
          $inc: {
            ongoingJobs,
            completedJobs,
            totalEarnings
          },
          $set: {
            recentDelivery
          }
        },
        options
      )
      .exec() as Promise<ISellerDocument>;
  }

  async updateSellerReview(data: IReviewMessageDetails): Promise<void> {
    const ratingTypes: IRatingTypes = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five'
    };

    const ratingKey: string = ratingTypes[data.rating as keyof typeof ratingTypes];

    await this.sellerModel.updateOne(
      {
        _id: new Types.ObjectId(data.sellerId)
      },
      {
        $inc: {
          [`ratingCategories.${ratingKey}.value`]: data.rating,
          [`ratingCategories.${ratingKey}.count`]: 1,
          ratingSum: data.rating,
          ratingsCount: 1
        }
      }
    );
  }
}
