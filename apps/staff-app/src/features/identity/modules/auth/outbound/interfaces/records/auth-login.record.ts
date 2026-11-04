import { StaffUser } from '@acme-staff/common/entities';

export type IAuthLoginStaffUserRecord = Pick<StaffUser, 'id' | 'email' | 'passwordHash' | 'status'>;
