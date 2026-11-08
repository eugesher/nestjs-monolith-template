import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleCreateCommand {
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
