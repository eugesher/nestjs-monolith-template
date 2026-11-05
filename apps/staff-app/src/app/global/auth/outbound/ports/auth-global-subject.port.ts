import { Nullable } from '@acme-libs/toolkit';

import { IAuthGlobalSubjectFindSubjectCommand, IAuthGlobalSubjectView } from '../interfaces';

export interface IAuthGlobalSubjectPort {
  findSubject(
    command: IAuthGlobalSubjectFindSubjectCommand,
  ): Promise<Nullable<IAuthGlobalSubjectView>>;
}

export const AUTH_GLOBAL_SUBJECT_PORT = Symbol('AUTH_GLOBAL_SUBJECT_PORT');
