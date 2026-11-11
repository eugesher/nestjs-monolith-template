import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleRecordInput {
  id: string;
  name: string;
  rolePermissions: { code: PermissionCodeEnum }[];
}
