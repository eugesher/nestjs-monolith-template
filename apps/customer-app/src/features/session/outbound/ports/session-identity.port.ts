import { ISessionIdentityAccessTokenView, ISessionIdentityLoginCommand } from '../interfaces';

export interface ISessionIdentityPort {
  login(command: ISessionIdentityLoginCommand): Promise<ISessionIdentityAccessTokenView>;
}

export const SESSION_IDENTITY_PORT = Symbol('SESSION_IDENTITY_PORT');
