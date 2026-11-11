import type { ICredentialsLibSignAccessTokenCommand } from '@acme-libs/contracts/credentials';

export interface ICredentialsLibAccessTokenPort {
  sign(command: ICredentialsLibSignAccessTokenCommand): Promise<string>;
}

export const CREDENTIALS_LIB_ACCESS_TOKEN_PORT = Symbol('CREDENTIALS_LIB_ACCESS_TOKEN_PORT');
