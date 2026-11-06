import { StaffUser } from '@acme-core/entities';

export type IStaffAuthCoreFindByEmailStaffUserRecord = Pick<
  StaffUser,
  'id' | 'passwordHash' | 'status'
>;
