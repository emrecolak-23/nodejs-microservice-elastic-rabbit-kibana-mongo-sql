import { injectable, singleton } from 'tsyringe';
import { BuyerRepository } from '../repositories/buyer.repository';
import { BadRequestError, IBuyerDocument } from '@emrecolak-23/jobber-share';
import { IBuyerAttributes } from '@users/models/buyer.schema';

@injectable()
@singleton()
export class BuyerService {
  constructor(private readonly buyerRepository: BuyerRepository) {}

  async getRandomBuyers(count: number): Promise<IBuyerDocument[]> {
    return this.buyerRepository.getRandomBuyers(count);
  }

  async createBuyer(buyerData: IBuyerAttributes): Promise<void> {
    const checkIfBuyerExists: IBuyerDocument | null = await this.buyerRepository.getBuyerByEmail(buyerData.email);

    if (checkIfBuyerExists) {
      throw new BadRequestError('Buyer already exists', 'BuyerService createBuyer() method error');
    }

    await this.buyerRepository.createBuyer(buyerData);
  }
}
