import { AuthModel, SafeAuthDocument } from '@auth/models/auth.schema';
import { firstLetterUppercase, IAuthDocument, lowerCase } from '@emrecolak-23/jobber-share';
import { Model, Op } from 'sequelize';
import { injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class AuthRepository {
  
  async createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
    const result: Model = await AuthModel.create(data);
    

    const { password, ...userData }: IAuthDocument = result.dataValues;

    return userData as SafeAuthDocument;
  }

  async getAuthUserById(authId: number): Promise<IAuthDocument> {
    const user: Model = (await AuthModel.findOne({
      where: { id: authId },
      attributes: { exclude: ['password'] }
    })) as Model;

    return user?.dataValues;
  }

  async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
      }
    })) as Model;

    return user?.dataValues;
  }

  async getUserByUsername(username: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { username: firstLetterUppercase(username) }
    })) as Model;

    return user?.dataValues;
  }

  async getUserByEmail(email: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { email: lowerCase(email) }
    })) as Model;

    return user?.dataValues;
  }

  async getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: { emailVerificationToken: token },
      attributes: { exclude: ['password'] }
    })) as Model;

    return user?.dataValues;
  }

  async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | null> {
    const user: Model = (await AuthModel.findOne({
      where: {
        [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
      }
    })) as Model;

    return user?.dataValues;
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

}
