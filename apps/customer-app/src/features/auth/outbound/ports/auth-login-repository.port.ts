import { Maybe } from '@acme-libs/toolkit';
import { AuthCustomerModel } from '../../domain';

export interface IAuthLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<AuthCustomerModel>>;
}

export const AUTH_LOGIN_REPOSITORY_PORT = Symbol('AUTH_LOGIN_REPOSITORY_PORT');
