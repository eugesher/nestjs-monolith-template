import type { Nullable } from '@acme-libs/toolkit';

import type {
  IAuthIdentityFindSubjectCommand,
  IAuthIdentityLoginCommand,
  IAuthIdentityLoginView,
  IAuthIdentitySubjectView,
} from '../interfaces';

export interface IAuthIdentityPort {
  findSubject(
    command: IAuthIdentityFindSubjectCommand,
  ): Promise<Nullable<IAuthIdentitySubjectView>>;
  login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityLoginView>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
