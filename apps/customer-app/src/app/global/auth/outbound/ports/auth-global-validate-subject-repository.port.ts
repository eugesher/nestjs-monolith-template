import { Nullable } from '@acme-libs/toolkit';

import { IAuthGlobalCustomerRecord } from '../interfaces';

export interface IAuthGlobalValidateSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<IAuthGlobalCustomerRecord>>;
}

export const AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
