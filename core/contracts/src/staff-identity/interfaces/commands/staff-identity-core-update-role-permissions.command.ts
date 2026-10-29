import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreUpdateRolePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
