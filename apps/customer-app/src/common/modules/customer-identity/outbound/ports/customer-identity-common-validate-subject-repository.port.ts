import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCommonCustomerModel } from '../../domain';

export interface ICustomerIdentityCommonValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<CustomerIdentityCommonCustomerModel>>;
}

export const CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
