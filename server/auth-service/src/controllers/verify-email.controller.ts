import { Request, Response } from 'express';    
import { AuthService } from '@auth/services/auth.service';
import { IAuthUserResponse } from '@auth/interfaces';
import { StatusCodes } from 'http-status-codes';


export class VerifyEmailController {
    constructor(private readonly authService: AuthService) {}

    async verifyEmail(req: Request, res: Response): Promise<void> {

       const { token } = req.body
       
         
    }
}