import type { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreSubjectView {
  id: string;
  email: string;
  roles: string[];
  permissionCodes: PermissionCodeEnum[];
}
