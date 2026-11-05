import { Nullable } from '@acme-libs/toolkit';

import { IAuthCommonSubjectView, IAuthCommonValidateSubjectCommand } from '../interfaces';

export interface IAuthCommonPort {
  validateSubject(
    command: IAuthCommonValidateSubjectCommand,
  ): Promise<Nullable<IAuthCommonSubjectView>>;
}

export const AUTH_COMMON_PORT = Symbol('AUTH_COMMON_PORT');
