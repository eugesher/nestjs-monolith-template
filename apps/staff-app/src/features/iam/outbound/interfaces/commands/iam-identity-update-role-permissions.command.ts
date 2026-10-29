import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIamIdentityUpdateRolePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
