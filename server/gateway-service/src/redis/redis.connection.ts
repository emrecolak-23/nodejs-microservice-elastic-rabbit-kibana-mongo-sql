import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gateway/configs';
import { createClient, RedisClientType } from 'redis';

@singleton()
@injectable()
export class RedisConnection {
  private log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'gatewayServiceRedisConnection', 'debug');
  private client: RedisClientType = createClient({
    url: this.config.REDIS_HOST,
    socket: {
      connectTimeout: 30000
    }
  });

  constructor(private readonly config: EnvConfig) {}

  get redisClient(): RedisClientType {
    return this.client;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info(`GatewayService connected to Redis: ${this.client.ping()}`);
      this.cacheError();
    } catch (error) {
      this.log.log('error', 'GatewayService connect() method error: ', error);
      throw error;
    }
  }

  private cacheError(): void {
    this.client.on('error', (error: Error) => {
      this.log.error(error);
    });
  }
}
