import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIamRoleRecord {
  id: number;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
