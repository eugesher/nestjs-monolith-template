import { StaffRole, StaffUser } from '@acme-staff/common/entities';

interface IAuthCommonValidateSubjectStaffUserRecordUserRole {
  role: Pick<StaffRole, 'name'>;
}

export interface IAuthCommonValidateSubjectStaffUserRecord extends Pick<StaffUser, 'id' | 'email'> {
  userRoles: IAuthCommonValidateSubjectStaffUserRecordUserRole[];
}
