import { ISellerGig, winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { EnvConfig } from '@auth/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class ElasticSearch {
  log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'authServiceElasticConnection', 'debug');
  elasticSearchClient: Client;

  constructor(private readonly config: EnvConfig) {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        this.log.info('AuthService Connecting to ElasticSearch...');
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        this.log.info(`AuthService ElasticSearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error('Connection to ElasticSearch failed, retrying in 3 seconds...');
        this.log.log('error', 'AuthService checkConnection method error: ', error);
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
      this.log.log('error', 'AuthService createIndex() method error:', error);
    }
  }

  async getDocumentById(indexName: string, docId: string): Promise<ISellerGig> {
    try {
      const document: GetResponse = await this.elasticSearchClient.get({
        index: indexName,
        id: docId
      });
      return document?._source as ISellerGig;
    } catch (error) {
      this.log.log('error', 'AuthService elasticSearch getDocumentById() method error:', error);
      return {} as ISellerGig;
    }
  }
}
