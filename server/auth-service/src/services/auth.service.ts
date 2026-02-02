import { AuthModel, SafeAuthDocument } from '@auth/models/auth.schema';
import { AuthProducer } from '@auth/queues/auth.producer';
import { firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument, lowerCase } from '@emrecolak-23/jobber-share';
import { Model, Op } from 'sequelize';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { EnvConfig } from '@auth/config';

export class AuthService {
  constructor(
    private readonly authProducer: AuthProducer,
    private readonly config: EnvConfig
  ) {}

  async createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
    const result: Model = await AuthModel.create(data);
    const messageDetails: IAuthBuyerMessageDetails = {
      username: result.dataValues.username,
      email: result.dataValues.email,
      profilePicture: result.dataValues.profilePicture,
      country: result.dataValues.country,
      createdAt: result.dataValues.createdAt,
      type: 'auth'
    };

    await this.authProducer.publishDirectMessage(
      authChannel,
      'jobber-buyer-update',
      'user-buyer',
      JSON.stringify(messageDetails),
      'buyer details sent to buyer service'
    );

    const { password, ...userData }: IAuthDocument = result.dataValues;

    return userData as SafeAuthDocument;
  }

  async getAuthUserById(authId: number): Promise<IAuthDocument> {
    const user: Model = (await AuthModel.findOne({
      where: { id: authId },
      attributes: { exclude: ['password'] }
    })) as Model;

    return user.dataValues;
  }

  async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
      }
    })) as Model;

    return user.dataValues;
  }

  async getUserByUsername(username: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { username: firstLetterUppercase(username) }
    })) as Model;

    return user.dataValues;
  }

  async getUserByEmail(email: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { email: lowerCase(email) }
    })) as Model;

    return user.dataValues;
  }

  async getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { emailVerificationToken: token },
      attributes: { exclude: ['password'] }
    })) as Model;

    return user.dataValues;
  }

  async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: {
        [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
      }
    })) as Model;

    return user.dataValues;
  }

  async updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> {
    await AuthModel.update(
      {
        emailVerified,
        emailVerificationToken
      },
      {
        where: { id: authId }
      }
    );
  }

  async updatePasswordToken(authId: number, token: string, tokenExpiration: Date) {
    await AuthModel.update(
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      {
        where: { id: authId }
      }
    );
  }

  async updatePassword(authId: number, password: string) {
    await AuthModel.update(
      {
        password,
        passwordResetToken: '',
        passwordResetExpires: new Date()
      },
      {
        where: { id: authId }
      }
    );
  }

  signToken(id: number, email: string, username: string): string {
    return sign({ id, email, username }, this.config.JWT_TOKEN!);
  }
}
