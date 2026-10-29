import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
