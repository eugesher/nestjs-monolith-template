import { StaffRole, StaffRolePermission } from '@acme-core/entities';

export type IRoleUpdatePermissionsRoleRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: Pick<StaffRolePermission, 'code'>[];
};
