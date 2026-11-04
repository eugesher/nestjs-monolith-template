import { Nullable } from '@acme-libs/toolkit';

import { IAuthGlobalValidateSubjectCustomerRecord } from '../interfaces';

export interface IAuthGlobalValidateSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<IAuthGlobalValidateSubjectCustomerRecord>>;
}

export const AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
