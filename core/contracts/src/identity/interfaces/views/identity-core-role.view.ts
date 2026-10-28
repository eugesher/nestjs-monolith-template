import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
