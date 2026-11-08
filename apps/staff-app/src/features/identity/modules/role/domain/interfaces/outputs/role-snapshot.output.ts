import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleSnapshotOutput {
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
