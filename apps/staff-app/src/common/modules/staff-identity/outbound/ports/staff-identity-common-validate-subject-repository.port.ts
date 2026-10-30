import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonUserModel } from '../../domain';

export interface IStaffIdentityCommonValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<StaffIdentityCommonUserModel>>;
}

export const STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
