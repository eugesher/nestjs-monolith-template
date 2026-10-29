import { ICredentialsAccessTokenPayloadCommand } from '../interfaces';

export interface ICredentialsAccessTokenPort {
  sign(payload: ICredentialsAccessTokenPayloadCommand): Promise<string>;
}

export const CREDENTIALS_ACCESS_TOKEN_PORT = Symbol('CREDENTIALS_ACCESS_TOKEN_PORT');
