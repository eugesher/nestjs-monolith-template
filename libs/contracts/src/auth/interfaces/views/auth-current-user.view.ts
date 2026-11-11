import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IAuthCurrentUserView {
  id: string;
  email: string;
  permissionCodes?: PermissionCodeEnum[];
}
