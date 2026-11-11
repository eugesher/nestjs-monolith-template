import type { IAuthCredentialsVerifyPasswordCommand } from '../interfaces';

export interface IAuthCredentialsPort {
  issueAccessToken(customerId: string): Promise<string>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(command: IAuthCredentialsVerifyPasswordCommand): Promise<boolean>;
}

export const AUTH_CREDENTIALS_PORT = Symbol('AUTH_CREDENTIALS_PORT');
