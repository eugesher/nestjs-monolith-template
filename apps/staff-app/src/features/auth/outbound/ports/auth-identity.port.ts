import { Maybe } from '@acme-libs/toolkit';
import {
  IAuthIdentityAccessTokenView,
  IAuthIdentityFindSubjectQuery,
  IAuthIdentityLoginCommand,
  IAuthIdentitySubjectView,
} from '../interfaces';

export interface IAuthIdentityPort {
  login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityAccessTokenView>;
  findSubject(query: IAuthIdentityFindSubjectQuery): Promise<Maybe<IAuthIdentitySubjectView>>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
