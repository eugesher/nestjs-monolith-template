import { StaffRolePermission } from '@acme-staff/common/entities';

export type IRoleUpdatePermissionsRolePermissionInsertQuery = Pick<
  StaffRolePermission,
  'roleId' | 'permissionId'
>;
