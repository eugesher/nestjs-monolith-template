import { Maybe } from '@acme-libs/toolkit';
import { CustomerIdentityCommonCustomerModel } from '../../domain';

export interface ICustomerIdentityCommonLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<CustomerIdentityCommonCustomerModel>>;
}

export const CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT',
);
