import { IAuthPasswordVerifyCommand } from '../interfaces';

export interface IAuthPasswordHasherPort {
  verify(command: IAuthPasswordVerifyCommand): Promise<boolean>;
}

export const AUTH_PASSWORD_HASHER_PORT = Symbol('AUTH_PASSWORD_HASHER_PORT');
