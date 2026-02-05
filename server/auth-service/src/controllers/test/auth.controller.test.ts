import { StatusCodes } from 'http-status-codes';
import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { authRequest, authMockResponse, authUserPayload, authMock } from './mocks/auth.mock';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      currentUser: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    authController = new AuthController(mockAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('currentUser method', () => {
    it('should return current user successfully', async () => {
      const req = authRequest({}, {}, authUserPayload) as any;
      const res = authMockResponse();
      mockAuthService.currentUser = jest.fn().mockResolvedValue(authMock);

      await authController.currentUser(req, res);

      expect(mockAuthService.currentUser).toHaveBeenCalledWith(authUserPayload.id);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User fetched successfully',
        user: authMock
      });
    });

    it('should return null when user is not found', async () => {
      const req = authRequest({}, {}, authUserPayload) as any;
      const res = authMockResponse();
      mockAuthService.currentUser = jest.fn().mockResolvedValue(null);

      await authController.currentUser(req, res);

      expect(mockAuthService.currentUser).toHaveBeenCalledWith(authUserPayload.id);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User fetched successfully',
        user: null
      });
    });

    it('should handle service errors', async () => {
      const req = authRequest({}, {}, authUserPayload) as any;
      const res = authMockResponse();
      const error = new Error('Service error');
      mockAuthService.currentUser = jest.fn().mockRejectedValue(error);

      await expect(authController.currentUser(req, res)).rejects.toThrow('Service error');
      expect(mockAuthService.currentUser).toHaveBeenCalledWith(authUserPayload.id);
    });
  });
});
