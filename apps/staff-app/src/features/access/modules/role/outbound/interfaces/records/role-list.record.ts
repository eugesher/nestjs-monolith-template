import type { StaffRole, StaffRolePermission } from '@acme-core/entities';

export type IRoleListRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: Pick<StaffRolePermission, 'code'>[];
};
