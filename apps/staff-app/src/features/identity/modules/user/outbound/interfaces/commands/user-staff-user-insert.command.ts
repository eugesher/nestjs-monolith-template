import { UserStatusEnum } from '@acme-libs/kernel';

export interface IUserStaffUserInsertCommand {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
