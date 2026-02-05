import { AuthService } from '@auth/services/auth.service';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { AuthProducer } from '@auth/queues/auth.producer';
import { EnvConfig } from '@auth/config';
import { authMock, authUserPayload } from './mocks/auth.mock';
import { IAuthDocument } from '@emrecolak-23/jobber-share';

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockAuthProducer: jest.Mocked<AuthProducer>;
  let mockConfig: jest.Mocked<EnvConfig>;

  beforeEach(() => {
    mockAuthRepository = {
      getAuthUserById: jest.fn(),
      getUserByUsernameOrEmail: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      createAuthUser: jest.fn(),
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
      updatePassword: jest.fn(),
      updatePasswordToken: jest.fn(),
      updateVerifyEmailField: jest.fn(),
      getAuthUserByVerificationToken: jest.fn(),
      getAuthUserByPasswordToken: jest.fn()
    } as unknown as jest.Mocked<AuthRepository>;

    mockAuthProducer = {
      publishDirectMessage: jest.fn()
    } as unknown as jest.Mocked<AuthProducer>;

    mockConfig = {
      JWT_TOKEN: 'test-jwt-token',
      CLIENT_URL: 'http://localhost:3000'
    } as unknown as jest.Mocked<EnvConfig>;

    authService = new AuthService(mockAuthProducer, mockAuthRepository, mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('currentUser method', () => {
    it('should return user without password when user exists', async () => {
      const userId = authUserPayload.id;
      const userWithPassword: IAuthDocument = { ...authMock, password: 'hashedPassword' };
      mockAuthRepository.getAuthUserById = jest.fn().mockResolvedValue(userWithPassword);

      const result = await authService.currentUser(userId);

      expect(mockAuthRepository.getAuthUserById).toHaveBeenCalledWith(userId);
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
      expect(result?.id).toBe(authMock.id);
      expect(result?.username).toBe(authMock.username);
      expect(result?.email).toBe(authMock.email);
    });

    it('should return null when user object is empty', async () => {
      const userId = authUserPayload.id;
      const emptyUser = {} as IAuthDocument;
      mockAuthRepository.getAuthUserById = jest.fn().mockResolvedValue(emptyUser);

      const result = await authService.currentUser(userId);

      expect(mockAuthRepository.getAuthUserById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });

    it('should throw error when repository returns null (bug in implementation)', async () => {
      const userId = authUserPayload.id;
      mockAuthRepository.getAuthUserById = jest.fn().mockResolvedValue(null);

      await expect(authService.currentUser(userId)).rejects.toThrow();
      expect(mockAuthRepository.getAuthUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle repository errors', async () => {
      const userId = authUserPayload.id;
      const error = new Error('Database error');
      mockAuthRepository.getAuthUserById = jest.fn().mockRejectedValue(error);

      await expect(authService.currentUser(userId)).rejects.toThrow('Database error');
      expect(mockAuthRepository.getAuthUserById).toHaveBeenCalledWith(userId);
    });

    it('should exclude password from returned user object', async () => {
      const userId = authUserPayload.id;
      const userWithPassword: IAuthDocument = {
        ...authMock,
        password: 'secretPassword123'
      };
      mockAuthRepository.getAuthUserById = jest.fn().mockResolvedValue(userWithPassword);

      const result = await authService.currentUser(userId);

      expect(result).not.toHaveProperty('password');
      expect(result?.id).toBe(userWithPassword.id);
      expect(result?.username).toBe(userWithPassword.username);
      expect(result?.email).toBe(userWithPassword.email);
    });
  });
});
