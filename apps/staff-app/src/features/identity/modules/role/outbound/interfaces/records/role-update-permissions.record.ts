import { StaffPermission, StaffRole } from '@acme-staff/common/entities';

type IRoleUpdatePermissionsRoleRecordPermission = Pick<StaffPermission, 'code'>;

interface IRoleUpdatePermissionsRoleRecordRolePermission {
  permission: IRoleUpdatePermissionsRoleRecordPermission;
}

export interface IRoleUpdatePermissionsRoleRecord extends Pick<StaffRole, 'id' | 'name'> {
  rolePermissions: IRoleUpdatePermissionsRoleRecordRolePermission[];
}

type IRoleUpdatePermissionsPermissionRecordItem = Pick<StaffPermission, 'id' | 'code'>;

export type IRoleUpdatePermissionsPermissionRecord = IRoleUpdatePermissionsPermissionRecordItem[];
