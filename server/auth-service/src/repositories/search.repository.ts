import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@auth/loaders';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerGig, winstonLogger } from '@emrecolak-23/jobber-share';

import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@singleton()
@injectable()
export class SearchRepository {
  constructor(private readonly elasticSearch: ElasticSearch) {}

  async gigById(indexName: string, gigId: string): Promise<ISellerGig> {
    const gig = await this.elasticSearch.getDocumentById(indexName, gigId);
    return gig;
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
          fields: ['title', 'description', 'tags', 'categories', 'subCategories', 'basicTitle', 'basicDescription'],
          query: `*${searchQuery}*`
        }
      },
      {
        term: {
          active: true
        }
      }
    ];

    if (deliveryTime !== undefined) {
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

    const result: SearchResponse = await this.elasticSearch.elasticSearchClient.search({
      index: 'gigs',
      size,
      query: {
        bool: {
          must: [...queryList] as any
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
}
