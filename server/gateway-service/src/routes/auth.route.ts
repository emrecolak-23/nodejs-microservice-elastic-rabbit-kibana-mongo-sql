import express, { Router } from 'express';
import { SignupController } from '@gateway/controllers/auth/signup.controller';
import { injectable, singleton } from 'tsyringe';
import { SigninController } from '@gateway/controllers/auth/signin.controller';
import { VerifyController } from '@gateway/controllers/auth/verify-email.controller';

@singleton()
@injectable()
export class AuthRoute {
  private router: Router;

  constructor(private readonly signUpController: SignupController, 
    private readonly signInController: SigninController, private verifyEmailController:VerifyController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', this.signUpController.create.bind(this.signUpController));
    this.router.post('/signin', this.signInController.read.bind(this.signInController));
    this.router.patch('/verify-email', this.verifyEmailController.verifyEmail.bind(this.verifyEmailController));
    return this.router;
  }
}
