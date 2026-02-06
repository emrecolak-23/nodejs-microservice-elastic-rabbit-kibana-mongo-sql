import { injectable, singleton } from 'tsyringe';
import { SellerRepository } from '@users/repositories/seller.repository';

@injectable()
@singleton()
export class SellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}
}
