import { StaffRole, StaffUser } from '@acme-staff/common/entities';

interface IUserAssignRoleStaffUserRecordUserRole {
  role: Pick<StaffRole, 'name'>;
}

export interface IUserAssignRoleStaffUserRecord extends Pick<
  StaffUser,
  'id' | 'email' | 'passwordHash' | 'status'
> {
  userRoles: IUserAssignRoleStaffUserRecordUserRole[];
}

export type IUserAssignRoleStaffRoleRecord = Pick<StaffRole, 'id'>;
