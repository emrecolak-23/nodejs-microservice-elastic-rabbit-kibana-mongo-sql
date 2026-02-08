import { inject, injectable, singleton } from 'tsyringe';
import { ISellerGig } from '@emrecolak-23/jobber-share';
import { IGigModel, IGigDocument } from '@gig/models/gig.schema';
import { Types } from 'mongoose';

@injectable()
@singleton()
export class GigRepository {
  constructor(@inject('GigModel') private readonly gigModel: IGigModel) {}

  toSellerGig(gig: IGigDocument): ISellerGig {
    const json = gig.toJSON?.();
    return json as unknown as ISellerGig;
  }

  async createGig(gigData: ISellerGig): Promise<IGigDocument> {
    const { _id, id, toJSON, sellerId, ...rest } = gigData;
    const gig = await this.gigModel.create({
      ...rest,
      sellerId: sellerId
        ? typeof sellerId === 'string'
          ? new Types.ObjectId(sellerId)
          : new Types.ObjectId(sellerId.toString())
        : new Types.ObjectId()
    });

    return gig;
  }
}
