import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
  permissionCodes: PermissionCodeEnum[];
}
