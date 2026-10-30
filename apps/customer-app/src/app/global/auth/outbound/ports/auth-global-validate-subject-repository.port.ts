import { Maybe } from '@acme-libs/toolkit';
import { IAuthGlobalCustomerView } from '../interfaces';

export interface IAuthGlobalValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<IAuthGlobalCustomerView>>;
}

export const AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
