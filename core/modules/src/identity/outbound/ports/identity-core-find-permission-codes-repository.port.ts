import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IIdentityCoreFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
