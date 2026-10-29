import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCoreCustomerModel } from '../../domain';

export interface ICustomerIdentityCoreLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<CustomerIdentityCoreCustomerModel>>;
}

export const CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT',
);
