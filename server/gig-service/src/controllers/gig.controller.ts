import { Request, Response } from 'express';
import { GigService } from '@gig/services/gig.service';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ISellerGig, uploads } from '@emrecolak-23/jobber-share';
import { UploadApiResponse } from 'cloudinary';
import { SearchService } from '@gig/services/search.service';

@singleton()
@injectable()
export class GigController {
  constructor(
    private readonly gigService: GigService,
    private readonly searchService: SearchService
  ) {}

  async createGig(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.coverImage)) as UploadApiResponse;

    if (!result.public_id) {
      throw new BadRequestError('Cover image upload failed. Please try again.', 'GigController createGig() method error');
    }

    const gigCount: number = await this.searchService.getGigCount();

    const gigData: ISellerGig = {
      sellerId: req.body.sellerId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      profilePicture: req.body.profilePicture,
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      basicTitle: req.body.basicTitle,
      basicDescription: req.body.basicDescription,
      coverImage: result.secure_url,
      sortId: gigCount + 1
    };
    const createdGig: ISellerGig = await this.gigService.createGig(gigData);

    res.status(StatusCodes.CREATED).json({
      message: 'Gig created successfully',
      gig: createdGig
    });
  }
}
