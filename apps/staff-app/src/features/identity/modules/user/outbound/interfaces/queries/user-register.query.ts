import { StaffUser, StaffUserRole } from '@acme-staff/common/entities';

export type IUserRegisterStaffUserInsertQuery = Pick<
  StaffUser,
  'email' | 'passwordHash' | 'status'
>;

export type IUserRegisterStaffUserRoleInsertQuery = Pick<StaffUserRole, 'userId' | 'roleId'>;
