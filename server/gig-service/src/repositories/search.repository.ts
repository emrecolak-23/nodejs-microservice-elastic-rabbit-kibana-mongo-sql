import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@gig/loaders';
import { IHitsTotal, IQueryList, ISearchResult, winstonLogger } from '@emrecolak-23/jobber-share';

import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { Logger } from 'winston';
import { EnvConfig } from '@gig/config';

@singleton()
@injectable()
export class SearchRepository {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceSearchRepository', 'debug');
  constructor(
    private readonly elasticSearch: ElasticSearch,
    private readonly config: EnvConfig
  ) {}

  async gigsSearchBySellerId(searchQuery: string, type: boolean): Promise<ISearchResult> {
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['sellerId'],
          query: `*${searchQuery}*`
        }
      },
      {
        term: {
          active: type
        }
      }
    ];

    this.log.info(`Search Query in search repository: ${JSON.stringify(queryList)}`);
    this.log.info(`Search Params in search repository: ${JSON.stringify({ searchQuery })}`);

    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      query: {
        bool: {
          must: queryList as any
        }
      }
    });

    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  }
}
