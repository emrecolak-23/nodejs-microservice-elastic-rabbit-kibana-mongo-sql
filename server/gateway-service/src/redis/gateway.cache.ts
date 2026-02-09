import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gateway/configs';
import { RedisConnection } from './redis.connection';

@singleton()
@injectable()
export class GatewayCache {
  private log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'gatewayServiceCache', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly redisConnection: RedisConnection
  ) {}

  async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.redisConnection.redisClient.isOpen) {
        await this.redisConnection.connect();
      }
      await this.redisConnection.redisClient.SET(key, value);
      this.log.info(`GatewayService saved user selected category: ${key}`);
      return;
    } catch (error) {
      this.log.log('error', 'GatewayService saveUserSelectedCategory() method error: ', error);
      throw error;
    }
  }

  async saveLoggedInUserToCache(key: string, value: string): Promise<string[] | null> {
    try {
      if (!this.redisConnection.redisClient.isOpen) {
        await this.redisConnection.connect();
      }
      const index: number | null = await this.redisConnection.redisClient.LPOS(key, value);
      if (index === null) {
        await this.redisConnection.redisClient.LPUSH(key, value);
        this.log.info(`GatewayService saved logged in user to cache: ${key}`);
      }
      const response: string[] = await this.redisConnection.redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.log('error', 'GatewayService saveLoggedInUserToCache() method error: ', error);
      return [];
    }
  }

  async getLoggedInUsersFromCache(key: string): Promise<string[] | null> {
    try {
      if (!this.redisConnection.redisClient.isOpen) {
        await this.redisConnection.connect();
      }
      const response: string[] = await this.redisConnection.redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.log('error', 'GatewayService getLoggedInUsersFromCache() method error: ', error);
      return [];
    }
  }

  async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.redisConnection.redisClient.isOpen) {
        await this.redisConnection.connect();
      }
      await this.redisConnection.redisClient.LREM(key, 1, value);
      this.log.info(`GatewayService removed logged in user from cache: ${key}`);
      const response: string[] = await this.redisConnection.redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.log('error', 'GatewayService removeLoggedInUserFromCache() method error: ', error);
      return [];
    }
  }
}
