import express, { Router } from 'express';
import { SignupController } from '@gateway/controllers/auth/signup.controller';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class AuthRoute {
  private router: Router;

  constructor(private readonly signUpController: SignupController) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/auth/signup', this.signUpController.create.bind(this.signUpController));

    return this.router;
  }
}
