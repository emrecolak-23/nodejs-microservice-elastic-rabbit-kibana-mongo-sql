import { injectable, singleton } from 'tsyringe';
import { ElasticSearch } from '@auth/loaders';

@singleton()
@injectable()
export class SearchService {
  constructor(private readonly elasticSearch: ElasticSearch) {}

  async gigById(indexName: string, gigId: string) {
    const gig = await this.elasticSearch.getDocumentById(indexName, gigId);
    return gig;
  }
}
