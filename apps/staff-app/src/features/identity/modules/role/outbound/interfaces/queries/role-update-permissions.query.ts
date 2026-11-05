import { StaffRolePermission } from '@acme-core/entities';

export type IRoleUpdatePermissionsRolePermissionInsertQuery = Pick<
  StaffRolePermission,
  'roleId' | 'permissionId'
>;
