import { StaffRole, StaffUser } from '@acme-staff/common/entities';

export type IAuthCommonValidateSubjectStaffUserRecord = Pick<StaffUser, 'id' | 'email'> & {
  userRoles: { role: Pick<StaffRole, 'name'> }[];
};
