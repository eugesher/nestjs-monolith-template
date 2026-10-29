import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCoreUserModel } from '../../domain';

export interface IStaffIdentityCoreValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<StaffIdentityCoreUserModel>>;
}

export const STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
