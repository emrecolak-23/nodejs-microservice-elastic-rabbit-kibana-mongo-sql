import { injectable, singleton } from 'tsyringe';
import { IPaginateProps, ISearchResult, ISellerGig, winstonLogger } from '@emrecolak-23/jobber-share';
import { SearchRepository } from '@gig/repositories/search.repository';
import { Logger } from 'winston';
import { EnvConfig } from '@gig/config';
import { sortHits } from '@gig/utils/sort-hits.util';

@injectable()
@singleton()
export class SearchService {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceSearchService', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly searchRepository: SearchRepository
  ) {}

  async gigsSearchBySellerId(searchQuery: string): Promise<{ hits: Record<string, unknown>[]; total: number }> {
    let resultHits: Record<string, unknown>[] = [];

    try {
      const gigs = await this.searchRepository.gigsSearchBySellerId(searchQuery, true);
      this.log.info(`Gigs in auth service: ${JSON.stringify(gigs)}`);
      for (const item of gigs.hits) {
        resultHits.push(item._source as Record<string, unknown>);
      }

      return {
        hits: resultHits,
        total: gigs.total
      };
    } catch (error) {
      this.log.error('SearchService searchGigs method error: ', error);
      throw error;
    }
  }

  async searchGigs(
    searchQuery: string,
    paginate: IPaginateProps,
    deliveryTime?: string,
    min?: number,
    max?: number
  ): Promise<{ hits: ISellerGig[]; total: number }> {
    const gigs = await this.searchRepository.gigsSearch(searchQuery, paginate, deliveryTime, min, max);

    let resultHits = await this.extractHits(gigs);

    if (paginate.type === 'backward') {
      resultHits = sortHits(resultHits);
    }

    return {
      total: gigs.total,
      hits: resultHits
    };
  }

  async getGigCount(): Promise<number> {
    try {
      const count = await this.searchRepository.getGigCount();
      return count;
    } catch (error) {
      this.log.error('SearchService getGigCount method error: ', error);
      return 0;
    }
  }

  async getTopRatedGigsByCategory(category: string): Promise<{ hits: ISellerGig[]; total: number }> {
    const gigs: ISearchResult = await this.searchRepository.getTopRatedGigsByCategory(category);

    const resultHits = await this.extractHits(gigs);

    return {
      total: gigs.total,
      hits: resultHits
    };
  }

  async gigsSearchByCategory(category: string): Promise<{ hits: ISellerGig[]; total: number }> {
    const gigs: ISearchResult = await this.searchRepository.gigsSearchByCategory(category);

    const resultHits = await this.extractHits(gigs);

    return {
      total: gigs.total,
      hits: resultHits
    };
  }

  async getMoreGigsLikeThis(gigId: string): Promise<{ hits: ISellerGig[]; total: number }> {
    const gigs: ISearchResult = await this.searchRepository.getMoreGigsLikeThis(gigId);

    const resultHits = await this.extractHits(gigs);

    return {
      total: gigs.total,
      hits: resultHits
    };
  }

  private async extractHits(gigs: ISearchResult): Promise<ISellerGig[]> {
    let resultHits: ISellerGig[] = [];

    for (const item of gigs.hits) {
      resultHits.push(item._source as ISellerGig);
    }

    return resultHits;
  }
}
