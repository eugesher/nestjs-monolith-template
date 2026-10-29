import {
  ISessionIdentityLoginCommand,
  ISessionIdentityRefreshCommand,
  ISessionIdentityTokenPairView,
} from '../interfaces';

export interface ISessionIdentityPort {
  login(command: ISessionIdentityLoginCommand): Promise<ISessionIdentityTokenPairView>;
  refresh(command: ISessionIdentityRefreshCommand): Promise<ISessionIdentityTokenPairView>;
}

export const SESSION_IDENTITY_PORT = Symbol('SESSION_IDENTITY_PORT');
