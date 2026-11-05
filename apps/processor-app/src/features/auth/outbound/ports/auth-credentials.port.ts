import { IAuthCredentialsVerifyPasswordCommand } from '../interfaces';

export interface IAuthCredentialsPort {
  issueAccessToken(userId: string): Promise<string>;
  verifyPassword(command: IAuthCredentialsVerifyPasswordCommand): Promise<boolean>;
}

export const AUTH_CREDENTIALS_PORT = Symbol('AUTH_CREDENTIALS_PORT');
