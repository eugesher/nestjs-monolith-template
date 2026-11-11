import type { Nullable } from '@acme-libs/toolkit';

import type {
  IAuthIdentityFindByEmailCommand,
  IAuthIdentityFindSubjectCommand,
  IAuthIdentitySubjectView,
  IAuthIdentityUserView,
} from '../interfaces';

export interface IAuthIdentityPort {
  findSubject(
    command: IAuthIdentityFindSubjectCommand,
  ): Promise<Nullable<IAuthIdentitySubjectView>>;
  findByEmail(command: IAuthIdentityFindByEmailCommand): Promise<Nullable<IAuthIdentityUserView>>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
