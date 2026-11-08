import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleUpdatePermissionsCommand {
  roleId: string;
  permissionCodes: PermissionCodeEnum[];
}
