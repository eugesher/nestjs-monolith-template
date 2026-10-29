export interface ICredentialsPasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
}

export const CREDENTIALS_PASSWORD_HASHER_PORT = Symbol('CREDENTIALS_PASSWORD_HASHER_PORT');
