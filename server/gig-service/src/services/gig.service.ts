import { injectable, singleton } from 'tsyringe';
import { GigRepository } from '@gig/repositories/gig.repository';
import { ICreateGig, ISellerGig } from '@emrecolak-23/jobber-share';
import { ElasticSearch } from '@gig/loaders';
import { SearchRepository } from '@gig/repositories/search.repository';
import { GigProducer } from '@gig/queues/gig.producer';
import { gigChannel } from '@gig/server';
import { IGigDocument } from '@gig/models/gig.schema';
@injectable()
@singleton()
export class GigService {
  constructor(
    private readonly gigRepository: GigRepository,
    private readonly elasticSearch: ElasticSearch,
    private readonly searchRepository: SearchRepository,
    private readonly gigProducer: GigProducer
  ) {}

  async getGigById(gigId: string): Promise<ISellerGig> {
    return await this.elasticSearch.getIndexedData('gigs', gigId);
  }

  async getSellerGigs(sellerId: string): Promise<ISellerGig[]> {
    const resultHits = [];
    const gigs = await this.searchRepository.gigsSearchBySellerId(sellerId, true);

    for (const item of gigs.hits) {
      resultHits.push(item._source as ISellerGig);
    }

    return resultHits;
  }

  async getSellerPausedGigs(sellerId: string): Promise<ISellerGig[]> {
    const resultHits = [];
    const gigs = await this.searchRepository.gigsSearchBySellerId(sellerId, false);

    for (const item of gigs.hits) {
      resultHits.push(item._source as ISellerGig);
    }

    return resultHits;
  }

  async createGig(gigData: ICreateGig): Promise<IGigDocument> {
    const createdGig = await this.gigRepository.createGig(gigData);
    if (createdGig) {
      const data: ISellerGig = this.gigRepository.toSellerGig(createdGig);
      await this.gigProducer.publishDirectMessage(
        gigChannel,
        'jobber-seller-update',
        'user-seller',
        JSON.stringify({ type: 'update-gig-count', gigSellerId: createdGig.sellerId?.toString(), count: 1 }),
        'Details sent to users service'
      );
      await this.elasticSearch.addDataToIndex('gigs', `${createdGig._id}`, data);
    }

    return createdGig;
  }
}
