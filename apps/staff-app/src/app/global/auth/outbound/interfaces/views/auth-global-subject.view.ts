import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IAuthGlobalSubjectView {
  id: string;
  email: string;
  permissionCodes: PermissionCodeEnum[];
}
