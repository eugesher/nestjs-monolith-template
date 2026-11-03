import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerInsertCommand {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
