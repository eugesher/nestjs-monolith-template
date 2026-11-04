import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerInsertQuery {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
