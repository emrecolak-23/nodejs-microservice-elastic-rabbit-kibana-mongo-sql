import { BadRequestError } from "@emrecolak-23/jobber-share";
import { NextFunction } from "express";
import { ObjectSchema } from "joi";


export class ValidateMiddleware {

    validate = (schema: ObjectSchema) => async (req: Request, _res: Response, next: NextFunction) => {
        const path = req.url.split('/')[1];
        const { value, error } = await Promise.resolve(schema.validate(req.body))

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            throw new BadRequestError(errorMessage, `AuthService ValidateMiddleware for ${path} route validate() method error`);     
        }

        Object.assign(req, value);
        return  next();
    }
}