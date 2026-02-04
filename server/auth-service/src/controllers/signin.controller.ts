import { Request, Response } from 'express';    
import { AuthService } from '@auth/services/auth.service';
import { IAuthUserResponse } from '@auth/interfaces';
import { StatusCodes } from 'http-status-codes';


export class SigninController {
    constructor(private readonly authService: AuthService) {}

    async read(req: Request, res: Response): Promise<void> {
       const { user, token } : IAuthUserResponse = await this.authService.signIn(req.body)

       res.status(StatusCodes.OK).json({
        message: 'User signed in successfully',
        user,
        token
       })
         
    }
}