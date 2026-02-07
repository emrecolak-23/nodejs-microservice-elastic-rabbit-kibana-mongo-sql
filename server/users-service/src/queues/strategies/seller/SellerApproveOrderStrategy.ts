import { injectable } from 'tsyringe';
import { SellerMessage, MESSAGE_TYPES } from '@users/queues/types/consumer.types';
import { IOrderMessage } from '@emrecolak-23/jobber-share';
import { SellerRepository } from '@users/repositories';
import { ISellerMessageStrategy } from './ISellerMessageStrategy';

@injectable()
export class SellerApproveOrderStrategy implements ISellerMessageStrategy {
  constructor(private readonly sellerRepository: SellerRepository) {}

  getType(): string {
    return MESSAGE_TYPES.SELLER.APPROVE_ORDER;
  }

  async handle(message: SellerMessage): Promise<void> {
    await this.sellerRepository.updateSellerCompletedJobsCount(message as IOrderMessage);
  }
}
