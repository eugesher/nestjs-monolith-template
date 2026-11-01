import { Nullable } from '@acme-libs/toolkit';

import { IAuthIdentityFindSubjectQuery, IAuthIdentitySubjectView } from '../interfaces';

export interface IAuthIdentityPort {
  findSubject(query: IAuthIdentityFindSubjectQuery): Promise<Nullable<IAuthIdentitySubjectView>>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
