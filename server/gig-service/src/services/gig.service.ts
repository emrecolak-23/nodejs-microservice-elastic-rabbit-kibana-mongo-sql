import { injectable, singleton } from 'tsyringe';
import { GigRepository } from '@gig/repositories/gig.repository';
import { ICreateGig, IRatingTypes, IReviewMessageDetails, ISellerGig } from '@emrecolak-23/jobber-share';
import { ElasticSearch } from '@gig/loaders';
import { SearchRepository } from '@gig/repositories/search.repository';
import { GigProducer } from '@gig/queues/gig.producer';
import { gigChannel } from '@gig/server';
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

  async createGig(gigData: ICreateGig): Promise<ISellerGig> {
    const createdGig = await this.gigRepository.createGig(gigData);

    const sellerGig: ISellerGig = this.gigRepository.toSellerGig(createdGig);
    await this.gigProducer.publishDirectMessage(
      gigChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify({ type: 'update-gig-count', gigSellerId: createdGig.sellerId?.toString(), count: 1 }),
      'Details sent to users service'
    );
    await this.elasticSearch.addDataToIndex('gigs', `${sellerGig.id}`, sellerGig);

    return sellerGig;
  }

  async deleteGig(gigId: string, sellerId: string): Promise<void> {
    await this.gigRepository.deleteGig(gigId);
    await this.gigProducer.publishDirectMessage(
      gigChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify({ type: 'update-gig-count', gigSellerId: sellerId, count: -1 }),
      'Details sent to users service'
    );
    await this.elasticSearch.deleteIndexedData('gigs', `${gigId}`);
  }

  async updateGig(gigId: string, gigData: ISellerGig): Promise<ISellerGig | null> {
    const updatedGig = await this.gigRepository.updateGig(gigId, gigData);

    if (updatedGig) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(updatedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
      return sellerGig;
    }

    return null;
  }

  async pauseOrUnpauseGig(gigId: string, gigActive: boolean): Promise<void> {
    const pausedOrUnpausedGig = await this.gigRepository.pauseOrUnpauseGig(gigId, gigActive);
    if (pausedOrUnpausedGig && pausedOrUnpausedGig.active === gigActive) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(pausedOrUnpausedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
    }
  }

  async updateGigReview(data: IReviewMessageDetails): Promise<void> {
    const ratingTypes: IRatingTypes = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five'
    };

    const ratingKey: string = ratingTypes[data.rating as keyof typeof ratingTypes];

    const updatedGig = await this.gigRepository.updateGigReviewProps(data.gigId!, ratingKey, data.rating as number);

    if (updatedGig) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(updatedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
    }
  }
}
