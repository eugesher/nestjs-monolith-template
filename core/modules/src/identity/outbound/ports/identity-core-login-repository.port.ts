import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<IdentityCoreUserModel>>;
}

export const IDENTITY_CORE_LOGIN_REPOSITORY_PORT = Symbol('IDENTITY_CORE_LOGIN_REPOSITORY_PORT');
