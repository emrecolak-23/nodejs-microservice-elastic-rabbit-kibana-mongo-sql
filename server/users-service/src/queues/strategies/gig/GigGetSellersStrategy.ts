import { injectable } from 'tsyringe';
import { Channel } from 'amqplib';
import { GigMessage, ISeedGigMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { SellerRepository } from '@users/repositories';
import { ISellerDocument } from '@users/models/seller.schema';
import { UserProducer } from '@users/queues/user.producer';
import { IGigMessageStrategy } from './IGigMessageStrategy';

@injectable()
export class GigGetSellersStrategy implements IGigMessageStrategy {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly userProducer: UserProducer
  ) {}

  getType(): string {
    return MESSAGE_TYPES.SEED_GIG.GET_SELLERS;
  }

  async handle(message: GigMessage, _channel: Channel): Promise<void> {
    const msg = message as ISeedGigMessage;
    const sellers: ISellerDocument[] = await this.sellerRepository.getRandomSellers(parseInt(`${msg.count}`, 10));
    await this.userProducer.publishDirectMessage({
      exchangeName: 'jobber-seed-gig',
      routingKey: 'receive-sellers',
      message: JSON.stringify({
        type: 'receiveSellers',
        sellers: sellers,
        count: msg.count
      }),
      logMessage: 'Message sent to gig service'
    });
  }
}
