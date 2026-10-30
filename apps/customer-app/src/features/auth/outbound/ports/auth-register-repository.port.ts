import { AuthCustomerModel } from '../../domain';

export interface IAuthRegisterRepositoryPort {
  insert(customer: AuthCustomerModel): Promise<void>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
