import { StaffRole } from '@acme-staff/common/entities';

type IUserRegisterStaffRoleRecordItem = Pick<StaffRole, 'id'>;

export type IUserRegisterStaffRoleRecord = IUserRegisterStaffRoleRecordItem[];
