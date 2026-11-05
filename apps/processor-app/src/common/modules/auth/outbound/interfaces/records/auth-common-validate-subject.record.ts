import { StaffRole, StaffUser } from '@acme-processor/common/entities';

export type IAuthCommonValidateSubjectStaffUserRecord = Pick<StaffUser, 'id' | 'email'> & {
  userRoles: { role: Pick<StaffRole, 'name'> }[];
};
