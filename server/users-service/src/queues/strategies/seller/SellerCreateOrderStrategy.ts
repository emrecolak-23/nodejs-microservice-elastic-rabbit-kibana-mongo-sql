import { injectable } from 'tsyringe';
import { SellerMessage, ISellerCreateOrderMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { SellerRepository } from '@users/repositories';
import { ISellerMessageStrategy } from './ISellerMessageStrategy';

@injectable()
export class SellerCreateOrderStrategy implements ISellerMessageStrategy {
  constructor(private readonly sellerRepository: SellerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.SELLER.CREATE_ORDER;
  }

  async handle(message: SellerMessage): Promise<void> {
    const msg = message as ISellerCreateOrderMessage;
    await this.sellerRepository.incrementSellerNumericField(msg.sellerId, 'ongoingJobs', msg.ongoingJobs);
  }
}
