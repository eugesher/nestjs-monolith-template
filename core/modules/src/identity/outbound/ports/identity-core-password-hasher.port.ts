export interface IIdentityCorePasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
}

export const IDENTITY_CORE_PASSWORD_HASHER_PORT = Symbol('IDENTITY_CORE_PASSWORD_HASHER_PORT');
