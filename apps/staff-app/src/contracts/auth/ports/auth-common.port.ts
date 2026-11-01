import { Nullable } from '@acme-libs-toolkit';

import { IAuthCommonSubjectView, IAuthCommonValidateSubjectQuery } from '../interfaces';

export interface IAuthCommonPort {
  validateSubject(
    query: IAuthCommonValidateSubjectQuery,
  ): Promise<Nullable<IAuthCommonSubjectView>>;
}

export const AUTH_COMMON_PORT = Symbol('AUTH_COMMON_PORT');
