import { injectable } from 'tsyringe';
import { BuyerMessage, IBuyerAuthMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { IBuyerAttributes } from '@users/models/buyer.schema';
import { BuyerRepository } from '@users/repositories';
import { IBuyerMessageStrategy } from './IBuyerMessageStrategy';

@injectable()
export class BuyerAuthStrategy implements IBuyerMessageStrategy {
  constructor(private readonly buyerRepository: BuyerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.BUYER.AUTH;
  }

  async handle(message: BuyerMessage): Promise<void> {
    const msg = message as IBuyerAuthMessage;
    const buyer: IBuyerAttributes = {
      username: msg.username,
      email: msg.email,
      profilePicture: msg.profilePicture,
      country: msg.country,
      isSeller: false,
      purchasedGigs: []
    };
    await this.buyerRepository.createBuyer(buyer);
  }
}
