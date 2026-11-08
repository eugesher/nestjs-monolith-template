import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreSubjectRecordInput {
  id: string;
  email: string;
  userRoles: { role: { name: string; rolePermissions: { code: PermissionCodeEnum }[] } }[];
}
