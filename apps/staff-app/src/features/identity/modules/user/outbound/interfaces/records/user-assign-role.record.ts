import { StaffRole, StaffUser } from '@acme-core/entities';

export type IUserAssignRoleStaffUserRecord = Pick<
  StaffUser,
  'id' | 'email' | 'passwordHash' | 'status'
> & {
  userRoles: { role: Pick<StaffRole, 'name'> }[];
};

export type IUserAssignRoleStaffRoleRecord = Pick<StaffRole, 'id'>;
