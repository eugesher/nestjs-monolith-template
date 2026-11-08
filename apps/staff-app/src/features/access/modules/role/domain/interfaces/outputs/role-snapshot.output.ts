import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleSnapshotOutput {
  id: string;
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
