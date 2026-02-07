import { injectable, singleton } from 'tsyringe';
import { SellerRepository } from '@users/repositories/seller.repository';
import { ISellerAttributes, ISellerDocument } from '@users/models/seller.schema';
import { BadRequestError } from '@emrecolak-23/jobber-share';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { sample } from '@users/utils/sample.util';
import { randomEducation, randomExperiences } from '@users/utils';
import { IBuyerDocument } from '@users/models/buyer.schema';

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

  async getSellerById(sellerId: string): Promise<ISellerDocument | null> {
    return this.sellerRepository.getSellerById(sellerId);
  }

  async getSellerByUsername(username: string): Promise<ISellerDocument | null> {
    return this.sellerRepository.getSellerByUsername(username);
  }

  async getRandomSellers(count: number): Promise<ISellerDocument[]> {
    return this.sellerRepository.getRandomSellers(count);
  }

  async createRandomSellers(buyers: IBuyerDocument[]): Promise<void> {
    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i];
      const checkIfSellerExists: ISellerDocument | null = await this.sellerRepository.getSellerByEmail(buyer.email!);

      if (checkIfSellerExists) {
        continue;
      }

      const basicDescription: string = faker.commerce.productDescription().slice(0, 100);
      const skills: string[] = [
        'Programming',
        'Design',
        'Development',
        'Marketing',
        'SEO',
        'Content Writing',
        'Social Media',
        'Graphic Design',
        'Video Editing',
        'Audio Editing',
        'Photo Editing',
        '3D Design',
        '2D Design',
        'Animation',
        '3D Animation',
        '2D Animation',
        '3D Modeling',
        '2D Modeling',
        '3D Rendering',
        '2D Rendering',
        '3D Printing',
        '2D Printing',
        '3D Scanning',
        '2D Scanning',
        '3D Scanning',
        '2D Scanning'
      ];
      const sellerData: ISellerAttributes = {
        profilePublicId: uuidv4(),
        fullName: faker.person.fullName(),
        username: buyer.username!,
        email: buyer.email!,
        country: faker.location.country(),
        profilePicture: buyer.profilePicture!,
        description: basicDescription.length <= 250 ? basicDescription : basicDescription.slice(0, 250),
        oneliner: faker.word.words({ count: { min: 5, max: 10 } }),
        skills: sample(skills, Math.floor(Math.random() * (4 - 1 + 1)) + 1),
        languages: [
          {
            language: 'English',
            level: 'Native'
          },
          {
            language: 'Spanish',
            level: 'Basic'
          },
          {
            language: 'French',
            level: 'Intermediate'
          }
        ],
        responseTime: parseInt(faker.commerce.price({ min: 1, max: 5, dec: 0 })),
        experience: randomExperiences(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
        education: randomEducation(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
        socialLinks: ['https://www.linkedin.com/in/john-doe', 'https://www.twitter.com/john-doe', 'https://www.github.com/john-doe'],
        certificates: [
          {
            name: 'Flutter Developer',
            from: 'Flutter Academy',
            year: 2020
          },
          {
            name: 'React Developer',
            from: 'Facebook',
            year: 2021
          },
          {
            name: 'Node.js Developer',
            from: 'Microsoft',
            year: 2022
          }
        ]
      };

      await this.sellerRepository.createSeller(sellerData);
    }
  }
}
