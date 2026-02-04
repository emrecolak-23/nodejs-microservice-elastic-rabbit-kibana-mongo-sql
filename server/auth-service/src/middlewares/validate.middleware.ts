import { BadRequestError } from "@emrecolak-23/jobber-share";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";
import { injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class ValidateMiddleware {
  validate(schema: ObjectSchema): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const path = req.url.split('/')[1];
      const { value, error } = schema.validate(req.body);

      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new BadRequestError(errorMessage, `AuthService ValidateMiddleware for ${path} route validate() method error`);
      }

      Object.assign(req, value);
      next();
    };
  }
}