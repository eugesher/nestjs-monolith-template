import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonUpdateRolePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
