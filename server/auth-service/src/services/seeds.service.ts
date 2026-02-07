import { firstLetterUppercase, IAuthDocument } from '@emrecolak-23/jobber-share';
import { injectable, singleton } from 'tsyringe';
import { generateUsername } from 'unique-username-generator';
import { faker } from '@faker-js/faker';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sample } from '@auth/utils/sample.util';
import { AuthProducer } from '@auth/queues/auth.producer';
import { IAuthBuyerMessageDetails } from '@emrecolak-23/jobber-share';
import { authChannel } from '@auth/server';
@injectable()
@singleton()
export class SeedsService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authProducer: AuthProducer
  ) {}

  async createSeeds(count: number): Promise<void> {
    const usernames: string[] = [];

    for (let i = 0; i < count; i++) {
      const username: string = generateUsername('', 0, 12);
      usernames.push(firstLetterUppercase(username));
    }

    for (let i = 0; i < usernames.length; i++) {
      const username: string = usernames[i];
      const email: string = faker.internet.email().toLowerCase();
      const password: string = 'Pass123.';
      const country: string = faker.location.country();
      const profilePicture: string = faker.image.urlPicsumPhotos();

      const checkIfUserExist: IAuthDocument | null = await this.authRepository.getUserByUsernameOrEmail(username, email);
      if (checkIfUserExist) {
        continue;
      }

      const profilePublicId: string = uuidv4();
      const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
      const randomCharacters = randomBytes.toString('hex');

      const authData: IAuthDocument = {
        username,
        email,
        password,
        country,
        profilePicture,
        profilePublicId,
        emailVerificationToken: randomCharacters,
        emailVerified: sample([0, 1]) as number
      } as IAuthDocument;

      await this.authRepository.createAuthUser(authData);

      const messageDetails: IAuthBuyerMessageDetails = {
        username: authData.username!,
        email: authData.email!,
        profilePicture: authData.profilePicture!,
        country: authData.country!,
        createdAt: authData.createdAt!,
        type: 'auth'
      };

      await this.authProducer.publishDirectMessage(
        authChannel,
        'jobber-buyer-update',
        'user-buyer',
        JSON.stringify(messageDetails),
        'Buyer details sent to buyer service.'
      );
    }
  }
}
