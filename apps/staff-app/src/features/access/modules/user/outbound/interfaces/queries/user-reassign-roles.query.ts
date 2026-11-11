import type { StaffUserRole } from '@acme-core/entities';

export type IUserReassignRolesStaffUserRoleInsertQuery = Pick<StaffUserRole, 'userId' | 'roleId'>;
