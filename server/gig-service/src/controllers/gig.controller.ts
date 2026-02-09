import { Request, Response } from 'express';
import { GigService } from '@gig/services/gig.service';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, isDataURL, ISellerGig, NotFoundError, uploads } from '@emrecolak-23/jobber-share';
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

  async updateGig(req: Request, res: Response): Promise<void> {
    const isDataUrl = isDataURL(req.body.coverImage);
    let coverImage: string;
    if (isDataUrl) {
      const result: UploadApiResponse = (await uploads(req.body.coverImage)) as UploadApiResponse;
      if (!result.public_id) {
        throw new BadRequestError('Cover image upload failed. Please try again.', 'GigController updateGig() method error');
      }
      coverImage = result.secure_url;
    } else {
      coverImage = req.body.coverImage;
    }

    const gigData: ISellerGig = {
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      basicTitle: req.body.basicTitle,
      basicDescription: req.body.basicDescription,
      coverImage: coverImage
    };

    const updatedGig: ISellerGig | null = await this.gigService.updateGig(req.params.gigId as string, gigData);

    if (!updatedGig) {
      throw new NotFoundError('Gig not found', 'GigController updateGig() method error');
    }

    res.status(StatusCodes.OK).json({
      message: 'Gig updated successfully',
      gig: updatedGig
    });
  }

  async deleteGig(req: Request, res: Response): Promise<void> {
    await this.gigService.deleteGig(req.params.gigId as string, req.params.sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Gig deleted successfully'
    });
  }

  async pauseOrUnpauseGig(req: Request, res: Response): Promise<void> {
    await this.gigService.pauseOrUnpauseGig(req.params.gigId as string, req.body.active as boolean);
    res.status(StatusCodes.OK).json({
      message: 'Gig paused/unpaused successfully'
    });
  }

  async getGigById(req: Request, res: Response): Promise<void> {
    const gig: ISellerGig = await this.gigService.getGigById(req.params.gigId as string);
    if (!gig) {
      throw new NotFoundError('Gig not found', 'GigController getGigById() method error');
    }
    res.status(StatusCodes.OK).json({
      message: 'Gig retrieved successfully',
      gig
    });
  }

  async getSellerGigs(req: Request, res: Response): Promise<void> {
    const gigs: ISellerGig[] = await this.gigService.getSellerGigs(req.params.sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Seller gigs retrieved successfully',
      gigs
    });
  }

  async getSellerPausedGigs(req: Request, res: Response): Promise<void> {
    const gigs: ISellerGig[] = await this.gigService.getSellerPausedGigs(req.params.sellerId as string);
    res.status(StatusCodes.OK).json({
      message: 'Seller paused gigs retrieved successfully',
      gigs
    });
  }
}
