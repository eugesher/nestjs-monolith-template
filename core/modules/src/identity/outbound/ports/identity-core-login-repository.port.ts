import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<IdentityCoreUserModel>>;
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const IDENTITY_CORE_LOGIN_REPOSITORY_PORT = Symbol('IDENTITY_CORE_LOGIN_REPOSITORY_PORT');
