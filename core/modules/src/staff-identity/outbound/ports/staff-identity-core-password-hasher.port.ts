export interface IStaffIdentityCorePasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
}

export const STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT = Symbol(
  'STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT',
);
