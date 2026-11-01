import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IRoleRecord {
  id: string;
  name: RoleEnum;
  permissionCodes: PermissionCodeEnum[];
}
