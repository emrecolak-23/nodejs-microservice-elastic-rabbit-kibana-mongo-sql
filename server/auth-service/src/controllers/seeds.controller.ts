import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { SeedsService } from '@auth/services/seeds.service';

@injectable()
@singleton()
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) {}

  async createSeeds(req: Request, res: Response): Promise<void> {
    const { count } = req.params;

    await this.seedsService.createSeeds(parseInt(count as string, 10));

    res.status(StatusCodes.CREATED).json({
      message: 'Seeds created successfully'
    });
  }
}
