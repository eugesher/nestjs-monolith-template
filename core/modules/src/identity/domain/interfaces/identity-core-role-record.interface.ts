import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreRoleRecord {
  id: number;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
