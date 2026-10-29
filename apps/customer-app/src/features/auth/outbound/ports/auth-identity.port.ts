import {
  IAuthIdentityAccessTokenView,
  IAuthIdentityLoginCommand,
  IAuthIdentityRegisterCommand,
  IAuthIdentityRegisterView,
} from '../interfaces';

export interface IAuthIdentityPort {
  register(command: IAuthIdentityRegisterCommand): Promise<IAuthIdentityRegisterView>;
  login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityAccessTokenView>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
