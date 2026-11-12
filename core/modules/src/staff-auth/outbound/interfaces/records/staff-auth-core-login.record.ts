import type { StaffUser } from '@acme-core/entities';

export type IStaffAuthCoreLoginStaffUserRecord = Pick<StaffUser, 'id' | 'passwordHash' | 'status'>;
