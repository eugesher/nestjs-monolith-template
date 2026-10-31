import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthStaffUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
