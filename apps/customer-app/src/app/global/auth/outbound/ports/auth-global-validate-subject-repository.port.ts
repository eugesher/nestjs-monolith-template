import { Nullable } from '@acme-libs/toolkit';

import { IAuthGlobalCustomerView } from '../interfaces';

export interface IAuthGlobalValidateSubjectRepositoryPort {
  findActiveById(id: string): Promise<Nullable<IAuthGlobalCustomerView>>;
}

export const AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
