import { injectable, singleton } from 'tsyringe';
import { IPaginateProps, winstonLogger } from '@emrecolak-23/jobber-share';
import { SearchRepository } from '@gig/repositories/search.repository';
import { Logger } from 'winston';
import { EnvConfig } from '@gig/config';

@injectable()
@singleton()
export class SeachService {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceSearchService', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly searchRepository: SearchRepository
  ) {}

  async searchGigs(searchQuery: string): Promise<{ hits: Record<string, unknown>[]; total: number }> {
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
}
