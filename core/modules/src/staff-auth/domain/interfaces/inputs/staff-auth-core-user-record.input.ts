import type { UserStatusEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreUserRecordInput {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
