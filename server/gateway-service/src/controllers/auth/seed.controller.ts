import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { AuthService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';

@injectable()
@singleton()
export class SeedController {
  constructor(private readonly authService: AuthService) {}

  async createSeeds(req: Request, res: Response): Promise<void> {
    const { count } = req.params;

    const response: AxiosResponse = await this.authService.seed(count as string);

    res.status(response.status).json({
      message: response.data.message
    });
  }
}
