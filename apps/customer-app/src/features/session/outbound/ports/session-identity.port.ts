import {
  ISessionIdentityAccessTokenView,
  ISessionIdentityLoginCommand,
  ISessionIdentityRegisterCommand,
  ISessionIdentityRegisterView,
} from '../interfaces';

export interface ISessionIdentityPort {
  register(command: ISessionIdentityRegisterCommand): Promise<ISessionIdentityRegisterView>;
  login(command: ISessionIdentityLoginCommand): Promise<ISessionIdentityAccessTokenView>;
}

export const SESSION_IDENTITY_PORT = Symbol('SESSION_IDENTITY_PORT');
