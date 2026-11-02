import { ICredentialsLibVerifyPasswordCommand } from '@acme-libs/contracts/credentials';

export interface ICredentialsLibPasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean>;
}

export const CREDENTIALS_LIB_PASSWORD_HASHER_PORT = Symbol('CREDENTIALS_LIB_PASSWORD_HASHER_PORT');
