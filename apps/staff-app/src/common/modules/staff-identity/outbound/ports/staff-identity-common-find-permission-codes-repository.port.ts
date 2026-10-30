import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
