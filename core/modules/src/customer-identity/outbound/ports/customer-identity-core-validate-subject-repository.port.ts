import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCoreCustomerModel } from '../../domain';

export interface ICustomerIdentityCoreValidateSubjectRepositoryPort {
  findById(id: string): Promise<Maybe<CustomerIdentityCoreCustomerModel>>;
}

export const CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT',
);
