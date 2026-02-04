import { IAuthDocument } from '@emrecolak-23/jobber-share';

export interface ICreateAuthUserResponse {
  user: IAuthDocument;
  token: string;
}