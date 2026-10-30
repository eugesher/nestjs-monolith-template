import { Maybe } from '@acme-libs/toolkit';
import { IAuthGlobalStaffUserView } from '../interfaces';

export interface IAuthGlobalSubjectPort {
  findSubject(userId: string): Promise<Maybe<IAuthGlobalStaffUserView>>;
}

export const AUTH_GLOBAL_SUBJECT_PORT = Symbol('AUTH_GLOBAL_SUBJECT_PORT');
