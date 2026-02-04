import { injectable, singleton } from 'tsyringe';
import { Request, Response } from 'express';
import { AuthService } from '@auth/services/auth.service';
import { StatusCodes } from 'http-status-codes';
import { IAuthUserResponse } from '@auth/interfaces';

@injectable()
@singleton()
export class SignupController {

    constructor(private readonly authService: AuthService) {}

    async create(req: Request, res: Response): Promise<void> {
       const { user, token } : IAuthUserResponse = await this.authService.createAuthUser(req.body)

       res.status(StatusCodes.CREATED).json({
        message: 'User created successfully',
        user,
        token
       })
        
    }

}