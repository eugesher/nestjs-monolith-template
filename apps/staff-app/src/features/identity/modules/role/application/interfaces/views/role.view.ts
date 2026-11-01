import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
