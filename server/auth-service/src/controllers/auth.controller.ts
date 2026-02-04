import { injectable, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import { AuthService } from '@auth/services/auth.service';
import { StatusCodes } from 'http-status-codes';
import { IAuthUserResponse } from '@auth/interfaces';
import { IAuthDocument } from '@emrecolak-23/jobber-share';

@injectable()
@singleton()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signUp(req: Request, res: Response): Promise<void> {
    const { user, token }: IAuthUserResponse = await this.authService.createAuthUser(req.body);

    res.status(StatusCodes.CREATED).json({
      message: 'User created successfully',
      user,
      token
    });
  }

  async signIn(req: Request, res: Response): Promise<void> {
    const { user, token }: IAuthUserResponse = await this.authService.signIn(req.body);

    res.status(StatusCodes.OK).json({
      message: 'User signed in successfully',
      user,
      token
    });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    const updatedUser: IAuthDocument = await this.authService.verifyEmail(token);

    res.status(StatusCodes.OK).json({
      message: 'Email verified successfully',
      user: updatedUser
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    await this.authService.forgotPassword(email);

    res.status(StatusCodes.OK).json({
      message: 'Password reset email sent successfully'
    });
  }
}
