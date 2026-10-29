import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreRoleRecord {
  id: number;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
