import express, { Router } from 'express';
import { SignupController } from '@auth/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@auth/middlewares';
import { signupSchema } from '@auth/schemas/signup';

@singleton()
@injectable()
export class AuthRoutes {
  private router: Router;

  constructor(private readonly signupController
    : SignupController, private readonly validateMiddleware: ValidateMiddleware) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post(
      '/signup',
      this.validateMiddleware.validate(signupSchema),
      this.signupController.create.bind(this.signupController),
    );

    return this.router;
  }
}