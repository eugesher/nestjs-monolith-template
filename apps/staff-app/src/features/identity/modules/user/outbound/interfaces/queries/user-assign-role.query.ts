import { StaffUserRole } from '@acme-staff/common/entities';

export type IUserAssignRoleStaffUserRoleInsertQuery = Pick<StaffUserRole, 'userId' | 'roleId'>;
