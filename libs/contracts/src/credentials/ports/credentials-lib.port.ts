import {
  ICredentialsLibSignAccessTokenCommand,
  ICredentialsLibVerifyPasswordCommand,
} from '../interfaces';

export interface ICredentialsLibPort {
  handleSignAccessToken(command: ICredentialsLibSignAccessTokenCommand): Promise<string>;
  handleHashPassword(password: string): Promise<string>;
  handleVerifyPassword(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean>;
}

export const CREDENTIALS_LIB_PORT = Symbol('CREDENTIALS_LIB_PORT');
