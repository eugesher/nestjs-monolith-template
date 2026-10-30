import { CustomerIdentityCommonCustomerModel } from '../../domain';

export interface ICustomerIdentityCommonRegisterRepositoryPort {
  insert(customer: CustomerIdentityCommonCustomerModel): Promise<void>;
}

export const CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT',
);
