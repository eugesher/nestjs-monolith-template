import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIamUpdateRolePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
