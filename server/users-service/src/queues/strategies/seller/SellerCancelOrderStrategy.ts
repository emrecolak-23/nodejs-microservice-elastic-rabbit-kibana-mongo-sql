import { injectable } from 'tsyringe';
import { SellerMessage, ISellerCancelOrderMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { SellerRepository } from '@users/repositories';
import { ISellerMessageStrategy } from './ISellerMessageStrategy';

@injectable()
export class SellerCancelOrderStrategy implements ISellerMessageStrategy {
  constructor(private readonly sellerRepository: SellerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.SELLER.CANCEL_ORDER;
  }

  async handle(message: SellerMessage): Promise<void> {
    const msg = message as ISellerCancelOrderMessage;
    await this.sellerRepository.updateSellerCancelledJobsCount(msg.sellerId);
  }
}
