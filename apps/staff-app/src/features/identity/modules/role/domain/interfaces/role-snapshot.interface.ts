import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleSnapshot {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
