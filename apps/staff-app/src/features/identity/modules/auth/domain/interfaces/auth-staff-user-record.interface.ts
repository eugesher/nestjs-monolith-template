import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthStaffUserRecord {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
