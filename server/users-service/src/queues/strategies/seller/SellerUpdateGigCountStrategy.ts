import { injectable } from 'tsyringe';
import { SellerMessage, ISellerUpdateGigCountMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { SellerRepository } from '@users/repositories';
import { ISellerMessageStrategy } from './ISellerMessageStrategy';

@injectable()
export class SellerUpdateGigCountStrategy implements ISellerMessageStrategy {
  constructor(private readonly sellerRepository: SellerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.SELLER.UPDATE_GIG_COUNT;
  }

  async handle(message: SellerMessage): Promise<void> {
    const msg = message as ISellerUpdateGigCountMessage;
    await this.sellerRepository.incrementSellerNumericField(msg.gigSellerId, 'totalGigs', msg.count);
  }
}
