import { Maybe } from '@acme-libs/toolkit';
import { AuthStaffUserModel } from '../../domain';

export interface IAuthLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<AuthStaffUserModel>>;
}

export const AUTH_LOGIN_REPOSITORY_PORT = Symbol('AUTH_LOGIN_REPOSITORY_PORT');
