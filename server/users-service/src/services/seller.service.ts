import { injectable, singleton } from 'tsyringe';
import { SellerRepository } from '@users/repositories/seller.repository';
import { ISellerAttributes, ISellerDocument } from '@users/models/seller.schema';
import { BadRequestError } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class SellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async getSellerByEmail(email: string): Promise<ISellerDocument | null> {
    return this.sellerRepository.getSellerByEmail(email);
  }

  async createSeller(sellerData: ISellerAttributes): Promise<ISellerDocument> {
    const checkIfSellerExists: ISellerDocument | null = await this.sellerRepository.getSellerByEmail(sellerData.email!);

    if (checkIfSellerExists) {
      throw new BadRequestError('Seller already exists', 'UserSerive getSellerByEmail() method error');
    }

    const createdSeller: ISellerDocument = await this.sellerRepository.createSeller(sellerData);

    return createdSeller;
  }

  async updateSeller(sellerId: string, sellerData: ISellerAttributes): Promise<ISellerDocument> {
    const updatedSeller: ISellerDocument = await this.sellerRepository.updateSeller(sellerId, sellerData);

    return updatedSeller;
  }
}
