import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleUpdatePermissionsCommand {
  role: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
