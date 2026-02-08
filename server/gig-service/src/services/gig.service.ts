import { injectable, singleton } from 'tsyringe';
import { GigRepository } from '@gig/repositories/gig.repository';
import { ISellerGig } from '@emrecolak-23/jobber-share';
import { ElasticSearch } from '@gig/loaders';
import { SearchRepository } from '@gig/repositories/search.repository';
@injectable()
@singleton()
export class GigService {
  constructor(
    private readonly gigRepository: GigRepository,
    private readonly elasticSearch: ElasticSearch,
    private readonly searchRepository: SearchRepository
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
}
