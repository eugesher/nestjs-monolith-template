import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthStaffUserFoundRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
