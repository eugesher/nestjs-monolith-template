import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IAuthGlobalFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
