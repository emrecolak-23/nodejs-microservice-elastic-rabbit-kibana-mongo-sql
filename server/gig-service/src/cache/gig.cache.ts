import { injectable, singleton } from 'tsyringe';
import { Redis } from '@gig/loaders/redis';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';

@singleton()
@injectable()
export class GigCache {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceGigCache', 'debug');

  constructor(
    private readonly redis: Redis,
    private readonly config: EnvConfig
  ) {}

  async getUserSelectedGigCategory(key: string): Promise<string | null> {
    try {
      const response = await this.redis.get(key);
      return response;
    } catch (error) {
      this.log.log('error', 'GigService GigCache getUserSelectedGigCategory() method error: ', error);
      return null;
    }
  }
}
