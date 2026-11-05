import { Nullable } from '@acme-libs/toolkit';

import { IAuthGlobalSubjectView } from '../interfaces';

export interface IAuthGlobalSubjectPort {
  findSubject(userId: string): Promise<Nullable<IAuthGlobalSubjectView>>;
}

export const AUTH_GLOBAL_SUBJECT_PORT = Symbol('AUTH_GLOBAL_SUBJECT_PORT');
