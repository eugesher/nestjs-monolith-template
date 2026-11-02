export interface IUserPasswordHasherPort {
  hash(password: string): Promise<string>;
}

export const USER_PASSWORD_HASHER_PORT = Symbol('USER_PASSWORD_HASHER_PORT');
