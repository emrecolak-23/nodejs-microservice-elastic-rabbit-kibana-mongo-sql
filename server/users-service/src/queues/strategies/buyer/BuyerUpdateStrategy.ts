import { injectable } from 'tsyringe';
import { BuyerMessage, IBuyerUpdateMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { BuyerRepository } from '@users/repositories';
import { IBuyerMessageStrategy } from './IBuyerMessageStrategy';

@injectable()
export class BuyerUpdateStrategy implements IBuyerMessageStrategy {
  constructor(private readonly buyerRepository: BuyerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.BUYER.UPDATE_PURCHASED_GIGS;
  }

  async handle(message: BuyerMessage): Promise<void> {
    const msg = message as IBuyerUpdateMessage;
    await this.buyerRepository.updateBuyerPurchasedGigsProp(msg.buyerId, msg.purchasedGigId, msg.type);
  }
}
