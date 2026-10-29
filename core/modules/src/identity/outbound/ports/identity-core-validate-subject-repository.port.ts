import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<IdentityCoreUserModel>>;
}

export const IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
