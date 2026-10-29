import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIamIdentityRoleView {
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
