import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleSnapshotOutput {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
