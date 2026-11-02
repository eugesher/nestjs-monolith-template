import {
  ICredentialsLibSignAccessTokenCommand,
  ICredentialsLibVerifyPasswordCommand,
} from '../interfaces';

export interface ICredentialsLibPort {
  signAccessToken(command: ICredentialsLibSignAccessTokenCommand): Promise<string>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean>;
}

export const CREDENTIALS_LIB_PORT = Symbol('CREDENTIALS_LIB_PORT');
