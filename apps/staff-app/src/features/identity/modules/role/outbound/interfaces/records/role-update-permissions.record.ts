import { StaffPermission, StaffRole } from '@acme-staff/common/entities';

type IRoleUpdatePermissionsRoleRecordPermission = Pick<StaffPermission, 'code'>;

interface IRoleUpdatePermissionsRoleRecordRolePermission {
  permission: IRoleUpdatePermissionsRoleRecordPermission;
}

export interface IRoleUpdatePermissionsRoleRecord extends Pick<StaffRole, 'id' | 'name'> {
  rolePermissions: IRoleUpdatePermissionsRoleRecordRolePermission[];
}

export type IRoleUpdatePermissionsPermissionRecord = Pick<StaffPermission, 'id' | 'code'>;
