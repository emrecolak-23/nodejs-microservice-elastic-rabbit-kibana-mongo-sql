import { injectable, singleton } from 'tsyringe';
import { AuthProducer } from '@auth/queues/auth.producer';
import { BadRequestError, firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument, IEmailMessageDetails, lowerCase, uploads } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@auth/config';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { v4 as uuidv4 } from 'uuid';
import { UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { ICreateAuthUserResponse } from '@auth/interfaces';
@injectable()
@singleton()
export class AuthService {
  constructor(
    private readonly authProducer: AuthProducer,
    private readonly authRepository: AuthRepository,
    private readonly config: EnvConfig
  ) {}

  async createAuthUser(data: IAuthDocument): Promise<ICreateAuthUserResponse> {
     const { username, email, password, country, profilePicture } = data
     const checkIfUserExists: IAuthDocument | null = await this.authRepository.getUserByUsernameOrEmail(username!,email!)
    
     if (checkIfUserExists) {
      throw new BadRequestError('Invalid credentials. Email or Username already in use', 'AuthService createAuthUser() method error');
     }
  
     const profilePublicId = uuidv4()
     const uploadResult: UploadApiResponse = await uploads(profilePicture!, profilePublicId, true, true) as UploadApiResponse
     if (!uploadResult.public_id) {
      throw new BadRequestError('Profile picture upload failed. Please try again.', 'AuthService createAuthUser() method error');
     }
     const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
     const randomCharacters: string = randomBytes.toString('hex')
     const authData: IAuthDocument = {
      username: firstLetterUppercase(username!),
      email: lowerCase(email!),
      country,
      password,
      profilePicture: uploadResult?.secure_url,
      profilePublicId,
      emailVerificationToken: randomCharacters,
      emailVerified: 0,
     } as IAuthDocument

     const newAuthUser: IAuthDocument = await this.authRepository.createAuthUser(authData)

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

    const verificationLink: string = `${this.config.CLIENT_URL}/confirm-email?token=${authData.emailVerificationToken}`

    const emailMessageDetails: IEmailMessageDetails = {
      receiverEmail: email,
      verifyLink: verificationLink,
      template: 'verifyEmail'
    } as IEmailMessageDetails

    await this.authProducer.publishDirectMessage(
      authChannel,
      'jobber-email-notification',
      'auth-email',
      JSON.stringify(emailMessageDetails),
      'verify email message has been sent to notification service'
    );

    const userJwt: string = this.signToken(newAuthUser.id!, newAuthUser.email!, newAuthUser.username!)

    return {
      user: newAuthUser,
      token: userJwt
    }
  }


  signToken(id: number, email: string, username: string): string {
    return sign({ id, email, username }, this.config.JWT_TOKEN!);
  }

}
