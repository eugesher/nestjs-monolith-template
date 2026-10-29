import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIamRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
