import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleDraftOutput {
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
