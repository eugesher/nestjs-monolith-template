import type { StaffUser, StaffUserRole } from '@acme-core/entities';

export type IUserRegisterStaffUserInsertQuery = Pick<
  StaffUser,
  'email' | 'passwordHash' | 'status'
>;

export type IUserRegisterStaffUserRoleInsertQuery = Pick<StaffUserRole, 'userId' | 'roleId'>;
