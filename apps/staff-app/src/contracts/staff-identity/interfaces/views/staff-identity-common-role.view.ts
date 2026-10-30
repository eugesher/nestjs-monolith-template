import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
