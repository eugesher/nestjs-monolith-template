import { Nullable } from '@acme-libs/toolkit';

import { IAuthIdentityFindSubjectCommand, IAuthIdentitySubjectView } from '../interfaces';

export interface IAuthIdentityPort {
  findSubject(
    command: IAuthIdentityFindSubjectCommand,
  ): Promise<Nullable<IAuthIdentitySubjectView>>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
