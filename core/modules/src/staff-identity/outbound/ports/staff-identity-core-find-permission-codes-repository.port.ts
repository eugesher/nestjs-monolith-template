import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<PermissionCodeEnum[]>;
}

export const STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
