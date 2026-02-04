import { injectable, singleton } from 'tsyringe';
import { AuthProducer } from '@auth/queues/auth.producer';
import {
  BadRequestError,
  firstLetterUppercase,
  IAuthBuyerMessageDetails,
  IAuthDocument,
  IEmailMessageDetails,
  isEmail,
  ISignInPayload,
  lowerCase,
  uploads
} from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@auth/config';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { v4 as uuidv4 } from 'uuid';
import { UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { IAuthUserResponse } from '@auth/interfaces';
@injectable()
@singleton()
export class AuthService {
  constructor(
    private readonly authProducer: AuthProducer,
    private readonly authRepository: AuthRepository,
    private readonly config: EnvConfig
  ) {}

  async createAuthUser(data: IAuthDocument): Promise<IAuthUserResponse> {
    const { username, email, password, country, profilePicture } = data;
    const checkIfUserExists: IAuthDocument | null = await this.authRepository.getUserByUsernameOrEmail(username!, email!);

    if (checkIfUserExists) {
      throw new BadRequestError('Invalid credentials. Email or Username already in use', 'AuthService createAuthUser() method error');
    }

    const profilePublicId = uuidv4();
    const uploadResult: UploadApiResponse = (await uploads(profilePicture!, profilePublicId, true, true)) as UploadApiResponse;
    if (!uploadResult.public_id) {
      throw new BadRequestError('Profile picture upload failed. Please try again.', 'AuthService createAuthUser() method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username!),
      email: lowerCase(email!),
      country,
      password,
      profilePicture: uploadResult?.secure_url,
      profilePublicId,
      emailVerificationToken: randomCharacters,
      emailVerified: 0
    } as IAuthDocument;

    const newAuthUser: IAuthDocument = await this.authRepository.createAuthUser(authData);

    const buyerMessageDetails: IAuthBuyerMessageDetails = {
      username: authData.username,
      email: authData.email,
      profilePicture: authData.profilePicture,
      country: authData.country,
      createdAt: newAuthUser.createdAt,
      type: 'auth'
    };

    await this.authProducer.publishDirectMessage(
      authChannel,
      'jobber-buyer-update',
      'user-buyer',
      JSON.stringify(buyerMessageDetails),
      'buyer details sent to buyer service'
    );

    const verificationLink: string = `${this.config.CLIENT_URL}/confirm-email?token=${authData.emailVerificationToken}`;

    const emailMessageDetails: IEmailMessageDetails = {
      receiverEmail: email,
      verifyLink: verificationLink,
      template: 'verifyEmail'
    } as IEmailMessageDetails;

    await this.authProducer.publishDirectMessage(
      authChannel,
      'jobber-email-notification',
      'auth-email',
      JSON.stringify(emailMessageDetails),
      'verify email message has been sent to notification service'
    );

    const userJwt: string = this.signToken(newAuthUser.id!, newAuthUser.email!, newAuthUser.username!);

    return {
      user: newAuthUser,
      token: userJwt
    };
  }

  async signIn(data: ISignInPayload): Promise<IAuthUserResponse> {
    const { username, password } = data;

    const isValidEmail: boolean = isEmail(username);

    const existingUser: IAuthDocument | null = isValidEmail
      ? await this.authRepository.getUserByEmail(username)
      : await this.authRepository.getUserByUsername(username);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials. User not found', 'AuthService signIn() method error');
    }

    const passwordsMatch: boolean = await this.authRepository.comparePassword(password, existingUser.password!);

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials. Password is incorrect', 'AuthService signIn() method error');
    }

    const userJwt: string = this.signToken(existingUser.id!, existingUser.email!, existingUser.username!);

    const { password: _, ...userWithoutPassword } = existingUser;

    return {
      user: userWithoutPassword,
      token: userJwt
    };
  }

  async verifyEmail(token: string): Promise<IAuthDocument> {
    const checkIfUserExists: IAuthDocument | null = await this.authRepository.getAuthUserByVerificationToken(token);

    if (!checkIfUserExists) {
      throw new BadRequestError('Verification token is either invalid or already used.', 'AuthService verifyEmail() method error');
    }

    await this.authRepository.updateVerifyEmailField(checkIfUserExists.id!, 1, '');

    const updatedUser: IAuthDocument = await this.authRepository.getAuthUserById(checkIfUserExists.id!);

    return updatedUser;
  }

  async forgotPassword(email: string): Promise<void> {
    const existingUser: IAuthDocument | null = await this.authRepository.getUserByEmail(email);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials', 'AuthService forgotPassword() method error');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters = randomBytes.toString('hex');
    const date: Date = new Date();
    date.setHours(date.getHours() + 1);

    await this.authRepository.updatePasswordToken(existingUser.id!, randomCharacters, date);

    const resetLink = `${this.config.CLIENT_URL}/reset-password?token=${randomCharacters}`;

    const messageDetails: IEmailMessageDetails = {
      receiverEmail: existingUser.email,
      resetLink: resetLink,
      username: existingUser.username,
      template: 'forgotPassword'
    };

    await this.authProducer.publishDirectMessage(
      authChannel,
      'jobber-email-notification',
      'auth-email',
      JSON.stringify(messageDetails),
      'Forgot password message has been sent to notification service'
    );
  }

  signToken(id: number, email: string, username: string): string {
    return sign({ id, email, username }, this.config.JWT_TOKEN!);
  }
}
