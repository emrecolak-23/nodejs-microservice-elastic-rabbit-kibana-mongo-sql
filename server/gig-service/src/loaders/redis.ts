import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@singleton()
@injectable()
export class Redis {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceRedisConnection', 'debug');
  private client: RedisClient;
  constructor(private readonly config: EnvConfig) {
    this.client = createClient({
      url: this.config.REDIS_HOST
    });
    this.cacheError();
  }

  get redisClient(): RedisClient {
    return this.client;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info(`GigService Redis Connection: ${await this.client.ping()}`);
    } catch (error) {
      this.log.log('error', 'GigService Redis connect() method error: ', error);
    }
  }

  cacheError() {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }
}
