import express, { Router } from 'express';
import { AuthController } from '@auth/controllers';
import { injectable, singleton } from 'tsyringe';
import { ValidateMiddleware } from '@auth/middlewares';
import { signupSchema } from '@auth/schemas/signup';
import { signinSchema } from '@auth/schemas/signin';
import { verifyEmailSchema, resentEmailVerificationSchema } from '@auth/schemas/email';
import { emailSchema, passwordSchema, changePasswordSchema } from '@auth/schemas/password';

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

    this.router.patch(
      '/change-password',
      this.validateMiddleware.validate(changePasswordSchema),
      this.authController.changePassword.bind(this.authController)
    );

    this.router.get('/current-user', this.authController.currentUser.bind(this.authController));

    this.router.post(
      '/resent-email-verification',
      this.validateMiddleware.validate(verifyEmailSchema),
      this.authController.resentEmailVerification.bind(this.authController)
    );

    return this.router;
  }
}
