import { Maybe } from '@acme-libs/toolkit';
import { AuthCommonStaffUserModel } from '../../domain';

export interface IAuthCommonValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<AuthCommonStaffUserModel>>;
}

export const AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
