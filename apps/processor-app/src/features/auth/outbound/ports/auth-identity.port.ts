import type { IAuthIdentityLoginCommand, IAuthIdentityLoginView } from '../interfaces';

export interface IAuthIdentityPort {
  login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityLoginView>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
