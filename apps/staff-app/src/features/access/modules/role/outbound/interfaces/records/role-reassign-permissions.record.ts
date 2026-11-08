import { StaffRole, StaffRolePermission } from '@acme-core/entities';

export type IRoleReassignPermissionsRoleRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: Pick<StaffRolePermission, 'code'>[];
};
