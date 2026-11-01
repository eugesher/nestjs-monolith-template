import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleRecord {
  id: number;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
