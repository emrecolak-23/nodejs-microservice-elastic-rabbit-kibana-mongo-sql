import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { BuyerService, SellerService } from '@users/services';
import { ISellerAttributes, ISellerDocument } from '@users/models/seller.schema';
import { IBuyerDocument } from '@users/models/buyer.schema';

@injectable()
@singleton()
export class SellerController {
  constructor(
    private readonly sellerService: SellerService,
    private readonly buyerService: BuyerService
  ) {}

  async createSeller(req: Request, res: Response): Promise<void> {
    const checkIfSellerExists: ISellerDocument | null = await this.sellerService.getSellerByEmail(req.body.email);

    if (checkIfSellerExists) {
      await this.buyerService.updateBuyerIsSeller(req.body.email);
      res.status(StatusCodes.OK).json({
        message: 'Seller profile already exists',
        seller: checkIfSellerExists
      });
      return;
    }

    const seller: ISellerAttributes = {
      profilePublicId: req.body.profilePublicId,
      fullName: req.body.fullName,
      username: req.currentUser!.username,
      email: req.body.email,
      profilePicture: req.body.profilePicture,
      description: req.body.description,
      oneliner: req.body.oneliner,
      country: req.body.country,
      skills: req.body.skills,
      languages: req.body.languages,
      responseTime: req.body.responseTime,
      experience: req.body.experience,
      education: req.body.education,
      socialLinks: req.body.socialLinks,
      certificates: req.body.certificates
    };

    const createdSeller: ISellerDocument = await this.sellerService.createSeller(seller);
    res.status(StatusCodes.CREATED).json({
      message: 'Seller created successfully',
      seller: createdSeller
    });
  }

  async updateSeller(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const seller: ISellerAttributes = {
      profilePublicId: req.body.profilePublicId,
      profilePicture: req.body.profilePicture,
      fullName: req.body.fullName,
      description: req.body.description,
      country: req.body.country,
      oneliner: req.body.oneliner,
      skills: req.body.skills,
      languages: req.body.languages,
      responseTime: req.body.responseTime,
      experience: req.body.experience,
      education: req.body.education,
      socialLinks: req.body.socialLinks,
      certificates: req.body.certificates
    };

    const updatedSeller: ISellerDocument = await this.sellerService.updateSeller(sellerId as string, seller);
    res.status(StatusCodes.OK).json({
      message: 'Seller updated successfully',
      seller: updatedSeller
    });
  }

  async getSellerById(req: Request, res: Response): Promise<void> {
    const { sellerId } = req.params;
    const seller: ISellerDocument | null = await this.sellerService.getSellerById(sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Seller profile retrieved successfully',
      seller: seller
    });
  }

  async getSellerByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const seller: ISellerDocument | null = await this.sellerService.getSellerByUsername(username as string);
    res.status(StatusCodes.OK).json({
      message: 'Seller profile retrieved successfully',
      seller: seller
    });
  }

  async getRandomSellers(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const sellers: ISellerDocument[] = await this.sellerService.getRandomSellers(parseInt(count as string, 10));
    res.status(StatusCodes.OK).json({
      message: 'Random sellers retrieved successfully',
      sellers: sellers
    });
  }

  async createRandomSellers(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const buyers: IBuyerDocument[] = await this.buyerService.getRandomBuyers(parseInt(count as string, 10));

    await this.sellerService.createRandomSellers(buyers);
    res.status(StatusCodes.OK).json({
      message: 'Sellers created successfully'
    });
  }
}
