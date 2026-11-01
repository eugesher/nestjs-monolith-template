import { Nullable } from '@acme-libs/toolkit';

import { AuthCommonStaffUserModel } from '../../domain';

export interface IAuthCommonValidateSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<AuthCommonStaffUserModel>>;
}

export const AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
