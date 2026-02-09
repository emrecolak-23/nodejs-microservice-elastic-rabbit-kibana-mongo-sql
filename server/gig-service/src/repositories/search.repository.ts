import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@gig/loaders';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, winstonLogger } from '@emrecolak-23/jobber-share';

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

  async getGigCount(): Promise<number> {
    return await this.elasticSearch.getDocumentCount('gigs');
  }

  async gigsSearch(
    searchQuery: string,
    paginate: IPaginateProps,
    deliveryTime?: string,
    min?: number,
    max?: number
  ): Promise<ISearchResult> {
    const { from, size, type } = paginate;

    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
          query: `*${searchQuery}*`
        }
      },
      {
        term: {
          active: true
        }
      }
    ];

    if (deliveryTime !== undefined && deliveryTime !== '') {
      queryList.push({
        query_string: {
          fields: ['expectedDelivery'],
          query: `*${deliveryTime}*`
        }
      });
    }

    if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
      queryList.push({
        range: {
          price: {
            gte: min,
            lte: max
          }
        }
      });
    }

    this.log.info(`Search Query in search repository: ${JSON.stringify(queryList)}`);
    this.log.info(`Search Params in search repository: ${JSON.stringify({ searchQuery, from, size, type })}`);

    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size,
      query: {
        bool: {
          must: queryList as any
        }
      },
      sort: [
        {
          sortId: type === 'forward' ? 'asc' : 'desc'
        }
      ],
      ...(from !== '0' && { search_after: [from] })
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  }

  async gigsSearchByCategory(searchQuery: string): Promise<ISearchResult> {
    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size: 10,
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: ['categories'],
                query: `*${searchQuery}*`
              }
            },
            {
              term: {
                active: true
              }
            }
          ] as any
        }
      }
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  }

  async getMoreGigsLikeThis(gigId: string): Promise<ISearchResult> {
    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size: 5,
      query: {
        more_like_this: {
          fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
          like: [
            {
              _index: 'gigs',
              _id: gigId
            }
          ]
        }
      }
    });

    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  }

  async getTopRatedGigsByCategory(searchQuery: string): Promise<ISearchResult> {
    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size: 10,
      query: {
        bool: {
          filter: {
            script: {
              script: {
                source: "doc['ratingSum'].value != 0 && (doc['ratingSum'].value / doc['ratingsCount'].value == params.threshold)",
                lang: 'painless',
                params: {
                  threshold: 5
                }
              }
            }
          },
          must: [
            {
              query_string: {
                fields: ['categories'],
                query: `*${searchQuery}*`
              }
            }
          ]
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
