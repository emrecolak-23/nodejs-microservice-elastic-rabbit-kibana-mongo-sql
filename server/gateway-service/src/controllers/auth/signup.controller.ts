import { AuthService } from "@gateway/services/api/auth.service";
import { AxiosResponse } from "axios";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { injectable, singleton } from "tsyringe";


@singleton()
@injectable()
export class SignupController {

    constructor(private readonly authService: AuthService) {}

    async create(req: Request, res: Response): Promise<void> {
        const response: AxiosResponse = await this.authService.sigUp(req.body)
        
        req.session = {
            jwt: response.data.token
        }

        res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user})
    
    }

}