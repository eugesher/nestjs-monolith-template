import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleView {
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
