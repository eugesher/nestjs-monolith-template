import { StaffPermission, StaffRole } from '@acme-core/entities';

export type IRoleUpdatePermissionsRoleRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: { permission: Pick<StaffPermission, 'code'> }[];
};

export type IRoleUpdatePermissionsPermissionRecord = Pick<StaffPermission, 'id' | 'code'>;
