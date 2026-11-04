import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthRegisterCustomerInsertQuery {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
