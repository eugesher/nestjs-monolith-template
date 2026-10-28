import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreUpdateRolePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
