import { Maybe } from '@acme-libs/toolkit';
import {
  ISessionIdentityAccessTokenView,
  ISessionIdentityFindSubjectQuery,
  ISessionIdentityLoginCommand,
  ISessionIdentitySubjectView,
} from '../interfaces';

export interface ISessionIdentityPort {
  login(command: ISessionIdentityLoginCommand): Promise<ISessionIdentityAccessTokenView>;
  findSubject(query: ISessionIdentityFindSubjectQuery): Promise<Maybe<ISessionIdentitySubjectView>>;
}

export const SESSION_IDENTITY_PORT = Symbol('SESSION_IDENTITY_PORT');
