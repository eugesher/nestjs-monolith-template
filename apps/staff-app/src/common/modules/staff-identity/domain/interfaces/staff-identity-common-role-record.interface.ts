import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonRoleRecord {
  id: number;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
