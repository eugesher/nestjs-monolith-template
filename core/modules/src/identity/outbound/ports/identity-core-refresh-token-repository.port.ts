import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreRefreshTokenRepositoryPort {
  findById(id: string): Promise<Maybe<IdentityCoreUserModel>>;
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const IDENTITY_CORE_REFRESH_TOKEN_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_REFRESH_TOKEN_REPOSITORY_PORT',
);
