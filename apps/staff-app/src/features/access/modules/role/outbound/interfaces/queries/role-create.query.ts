import { StaffRole, StaffRolePermission } from '@acme-core/entities';

export type IRoleCreateStaffRoleInsertQuery = Pick<StaffRole, 'name'>;

export type IRoleCreateRolePermissionInsertQuery = Pick<StaffRolePermission, 'roleId' | 'code'>;
