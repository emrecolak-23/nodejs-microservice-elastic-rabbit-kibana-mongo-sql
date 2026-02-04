import { AuthService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signUp(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.authService.sigUp(req.body);

    req.session = {
      jwt: response.data.token
    };

    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }

  async signIn(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.authService.signIn(req.body);

    req.session = {
      jwt: response.data.token
    };

    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.authService.verifyEmail(req.body.token);

    req.session = {
      jwt: response.data.token
    };

    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await this.authService.forgotPassword(req.body.email);

    res.status(StatusCodes.OK).json({ message: response.data.message });
  }
}
