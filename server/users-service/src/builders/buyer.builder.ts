import { injectable } from 'tsyringe';
import { IBuyerDocument, IBuyerModel } from '@users/models/buyer.schema';

@injectable()
export class BuyerBuilder {
  username?: string;
  email?: string;
  profilePicture?: string;
  country?: string;
  isSeller?: boolean;
  purchasedGigs?: string[];

  constructor(private readonly buyerModel: IBuyerModel) {}

  withUsername(username: string): this {
    this.username = username;
    return this;
  }

  withEmail(email: string): this {
    this.email = email;
    return this;
  }

  withProfilePicture(profilePicture: string): this {
    this.profilePicture = profilePicture;
    return this;
  }

  withCountry(country: string): this {
    this.country = country;
    return this;
  }

  withIsSeller(isSeller: boolean): this {
    this.isSeller = isSeller;
    return this;
  }

  withPurchasedGigs(purchasedGigs: string[]): this {
    this.purchasedGigs = purchasedGigs;
    return this;
  }

  build(): IBuyerDocument {
    if (!this.username || !this.email || !this.profilePicture || !this.country || !this.purchasedGigs) {
      throw new Error('Missing required fields');
    }

    return this.buyerModel.build({
      username: this.username!,
      email: this.email!,
      profilePicture: this.profilePicture!,
      country: this.country!,
      isSeller: this.isSeller,
      purchasedGigs: this.purchasedGigs!
    });
  }
}
