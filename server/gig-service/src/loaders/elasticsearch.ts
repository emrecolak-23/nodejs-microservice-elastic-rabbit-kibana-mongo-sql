import { ISellerGig, winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@gig/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, CountResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class ElasticSearch {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceElasticConnection', 'debug');
  elasticSearchClient: Client;

  constructor(private readonly config: EnvConfig) {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`,
      requestTimeout: 60000,
      pingTimeout: 3000
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        this.log.info('GigService Connecting to ElasticSearch...');
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        this.log.info(`GigService ElasticSearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error('Connection to ElasticSearch failed, retrying in 3 seconds...');
        this.log.log('error', 'GigService checkConnection method error: ', error);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async createIndex(indexName: string): Promise<void> {
    try {
      const indexExist: boolean = await this.elasticSearchClient.indices.exists({ index: indexName });
      if (indexExist) {
        this.log.info(`Index ${indexName} already exists`);
        return;
      }
      await this.elasticSearchClient.indices.create({ index: indexName });
      await this.elasticSearchClient.indices.refresh({ index: indexName });
      this.log.info(`Created index ${indexName}`);
    } catch (error) {
      this.log.error(`An error occured while creating index: ${indexName}`);
      this.log.log('error', 'GigService createIndex() method error:', error);
    }
  }

  async getIndexedData(index: string, itemId: string): Promise<ISellerGig> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({
        index,
        id: itemId
      });
      return result?._source as ISellerGig;
    } catch (error) {
      this.log.log('error', 'GigService getIndexedData() method error:', error);
      return {} as ISellerGig;
    }
  }

  async addDataToIndex(index: string, itemId: string, gigDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.index({ index, id: itemId, document: gigDocument });
    } catch (error) {
      this.log.log('error', 'GigService addDataToIndex() method error:', error);
    }
  }

  async updateIndexedData(index: string, itemId: string, gigDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.update({ index, id: itemId, doc: gigDocument });
    } catch (error) {
      this.log.log('error', 'GigService updateIndexedData() method error:', error);
    }
  }

  async deleteIndexedData(index: string, itemId: string): Promise<void> {
    try {
      await this.elasticSearchClient.delete({ index, id: itemId });
    } catch (error) {
      this.log.log('error', 'GigService deleteIndexedData() method error:', error);
    }
  }

  async getDocumentCount(index: string): Promise<number> {
    try {
      const result: CountResponse = await this.elasticSearchClient.count({ index });
      return result.count as number;
    } catch (error) {
      this.log.log('error', 'GigService getDocumentCount() method error:', error);
      return 0;
    }
  }
}
