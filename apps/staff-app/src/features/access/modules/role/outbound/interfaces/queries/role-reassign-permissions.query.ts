import type { StaffRolePermission } from '@acme-core/entities';

export type IRoleReassignPermissionsRolePermissionInsertQuery = Pick<
  StaffRolePermission,
  'roleId' | 'code'
>;
