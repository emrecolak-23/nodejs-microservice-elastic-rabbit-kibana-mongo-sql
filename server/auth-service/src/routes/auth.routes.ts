import express, { Router } from 'express';
import { AuthController } from '@auth/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@auth/middlewares';
import { signupSchema } from '@auth/schemas/signup';
import { signinSchema } from '@auth/schemas/signin';
import { verifyEmailSchema } from '@auth/schemas/email';
import { emailSchema, passwordSchema } from '@auth/schemas/password';

@singleton()
@injectable()
export class AuthRoutes {
  private router: Router;

  constructor(
    private readonly authController: AuthController,
    private readonly validateMiddleware: ValidateMiddleware
  ) {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', this.validateMiddleware.validate(signupSchema), this.authController.signUp.bind(this.authController));

    this.router.post('/signin', this.validateMiddleware.validate(signinSchema), this.authController.signIn.bind(this.authController));

    this.router.post(
      '/verify-email',
      this.validateMiddleware.validate(verifyEmailSchema),
      this.authController.verifyEmail.bind(this.authController)
    );

    this.router.post(
      '/forgot-password',
      this.validateMiddleware.validate(emailSchema),
      this.authController.forgotPassword.bind(this.authController)
    );

    this.router.patch(
      '/reset-password/:token',
      this.validateMiddleware.validate(passwordSchema),
      this.authController.resetPassword.bind(this.authController)
    );

    return this.router;
  }
}
