import { UserStatusEnum } from '@acme-libs/kernel';

export interface IUserStaffUserInsertQuery {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
