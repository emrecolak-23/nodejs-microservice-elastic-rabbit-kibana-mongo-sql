import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@order/config';
import { Redis } from '@order/loaders/redis';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class IdempotencyService {
  private readonly TTL_SECONDS = 60 * 60 * 24;
  private readonly KEY_PREFIX = 'idempotency';
  private readonly log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'idempotencyService', 'debug');

  constructor(
    private readonly config: EnvConfig,
    private readonly redis: Redis
  ) {}

  private getKey(messageId: string): string {
    return `${this.KEY_PREFIX}:${messageId}`;
  }

  async isProcessed(messageId: string): Promise<boolean> {
    const key = this.getKey(messageId);
    const exists = await this.redis.executeCommand(() => this.redis.redisClient.exists(key));

    if (exists === null) {
      this.log.warn(`Idempotency check failed for ${messageId}, treating as new message`);
      return false;
    }

    this.log.debug(`Idempotency check for ${messageId}: ${exists === 1 ? 'processed' : 'new'}`);
    return exists === 1;
  }

  async markAsProcessed(messageId: string, result?: unknown): Promise<void> {
    const key = this.getKey(messageId);
    const value = JSON.stringify({
      processedAt: new Date().toISOString(),
      result
    });

    const response = await this.redis.executeCommand(() => this.redis.redisClient.setEx(key, this.TTL_SECONDS, value));

    if (response === null) {
      this.log.warn(`Failed to mark message as processed: ${messageId}`);
      return;
    }

    this.log.debug(`Message marked as processed: ${messageId}`);
  }

  async clear(messageId: string): Promise<void> {
    const key = this.getKey(messageId);
    const deleted = await this.redis.executeCommand(() => this.redis.redisClient.del(key));

    if (deleted === null) {
      this.log.warn(`Failed to clear idempotency key: ${messageId}`);
      return;
    }

    this.log.info(`Idempotency key cleared: ${messageId}`);
  }

  async getOrCreate(id: string, value: string, ttlSeconds: number): Promise<string> {
    const key = this.getKey(id);

    const wasSet = await this.redis.executeCommand(() => this.redis.redisClient.set(key, value, { NX: true, EX: ttlSeconds }));

    if (wasSet === 'OK') {
      this.log.debug(`Idempotency key created: ${id} (ttl=${ttlSeconds}s)`);
      return value;
    }

    const existing = await this.redis.executeCommand(() => this.redis.redisClient.get(key));

    if (existing) {
      this.log.debug(`Idempotency key reused: ${id}`);
      return existing;
    }

    this.log.warn(`Failed to read existing idempotency key: ${id}, using new value as fallback`);
    return value;
  }
}
