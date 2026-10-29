import { CustomerIdentityCoreCustomerModel } from '../../domain';

export interface ICustomerIdentityCoreRegisterRepositoryPort {
  insert(customer: CustomerIdentityCoreCustomerModel): Promise<void>;
}

export const CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT = Symbol(
  'CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT',
);
