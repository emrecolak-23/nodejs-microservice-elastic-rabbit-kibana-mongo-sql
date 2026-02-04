import express, { Router } from 'express';
import { SigninController, SignupController } from '@auth/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@auth/middlewares';
import { signupSchema } from '@auth/schemas/signup';
import { signinSchema } from '@auth/schemas/signin';
import { VerifyEmailController } from '@auth/controllers/verify-email.controller';

@singleton()
@injectable()
export class AuthRoutes {
  private router: Router;

  constructor(
    private readonly signupController: SignupController, 
    private readonly signinController: SigninController,
    private readonly verifyEmailController: VerifyEmailController,
    private readonly validateMiddleware: ValidateMiddleware) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post(
      '/signup',
      this.validateMiddleware.validate(signupSchema),
      this.signupController.create.bind(this.signupController),
    );

    this.router.post("/signin", this.validateMiddleware.validate(signinSchema), this.signinController.read.bind(this.signinController));


    this.router.post("/verify-email", this.verifyEmailController.verifyEmail.bind(this.verifyEmailController));
    return this.router;
  }
}