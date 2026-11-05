import { Nullable } from '@acme-libs/toolkit';

import { IAuthCommonValidateSubjectStaffUserRecord } from '../interfaces';

export interface IAuthCommonValidateSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<IAuthCommonValidateSubjectStaffUserRecord>>;
}

export const AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
