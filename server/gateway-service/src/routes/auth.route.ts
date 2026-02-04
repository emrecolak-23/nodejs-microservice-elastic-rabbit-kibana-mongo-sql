import express, { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { AuthController } from '@gateway/controllers/auth/auth.controller';

@singleton()
@injectable()
export class AuthRoute {
  private router: Router;

  constructor(private readonly authController: AuthController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', this.authController.signUp.bind(this.authController));
    this.router.post('/signin', this.authController.signIn.bind(this.authController));
    this.router.patch('/verify-email', this.authController.verifyEmail.bind(this.authController));
    return this.router;
  }
}
