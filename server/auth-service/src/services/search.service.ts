import { injectable, singleton } from 'tsyringe';
import { SearchRepository } from '@auth/repositories/search.repository';
import { IPaginateProps, ISellerGig } from '@emrecolak-23/jobber-share';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@auth/config';
import { sortHits } from '@auth/utils/sort.util';
@injectable()
@singleton()
export class SearchService {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'authServiceSearchService', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly searchRepository: SearchRepository
  ) {}

  async searchGigs(
    searchQuery: string,
    paginate: IPaginateProps,
    deliveryTime?: string,
    min?: number,
    max?: number
  ): Promise<{ hits: Record<string, unknown>[]; total: number }> {
    let resultHits: Record<string, unknown>[] = [];

    try {
      const gigs = await this.searchRepository.gigsSearch(searchQuery, paginate, deliveryTime, min, max);

      for (const item of gigs.hits) {
        resultHits.push(item._source as Record<string, unknown>);
      }

      if (paginate.type === 'backward') {
        resultHits = sortHits(resultHits, 'sortId');
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

  async singleGigById(gigId: string): Promise<ISellerGig> {
    try {
      const gig = await this.searchRepository.gigById('gigs', gigId);
      return gig;
    } catch (error) {
      this.log.error('SearchService singleGigById method error: ', error);
      throw error;
    }
  }
}
