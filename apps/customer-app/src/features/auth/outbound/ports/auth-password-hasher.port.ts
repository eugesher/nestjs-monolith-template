import { IAuthPasswordVerifyCommand } from '../interfaces';

export interface IAuthPasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(command: IAuthPasswordVerifyCommand): Promise<boolean>;
}

export const AUTH_PASSWORD_HASHER_PORT = Symbol('AUTH_PASSWORD_HASHER_PORT');
