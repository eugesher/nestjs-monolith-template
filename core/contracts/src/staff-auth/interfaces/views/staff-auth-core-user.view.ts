import type { UserStatusEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreUserView {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
