import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleView {
  id: string;
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
