import { IAuthDocument, IAuthPayload } from '@emrecolak-23/jobber-share';
import { Request, Response } from 'express';

export const authRequest = (
  sessionData: IJWT,
  body: IAuthMock,
  currentUser: IAuthPayload | null,
  params?: Record<string, unknown>
): Partial<Request> => ({
  session: sessionData,
  body,
  currentUser,
  params: params || {}
} as Partial<Request>);

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date | string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  token?: string;
  userId?: number;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'emco03',
  email: 'emrecolak03@gmail.com',
  iat: 1717334400
};

export const authMock: IAuthDocument = {
  id: 1,
  profilePublicId: '1234567890',
  username: 'emco03',
  email: 'emrecolak03@gmail.com',
  password: 'password',
  country: 'Turkey',
  profilePicture: '',
  emailVerified: 1,
  createdAt: new Date('2025-02-05T09:00:00.000Z'),
  updatedAt: new Date('2025-02-05T09:00:00.000Z'),
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn().mockResolvedValue('hashedPassword')
} as unknown as IAuthDocument;
