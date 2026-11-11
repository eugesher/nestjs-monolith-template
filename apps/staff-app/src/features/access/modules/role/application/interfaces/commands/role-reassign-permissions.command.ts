import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleReassignPermissionsCommand {
  roleId: string;
  permissionCodes: PermissionCodeEnum[];
}
