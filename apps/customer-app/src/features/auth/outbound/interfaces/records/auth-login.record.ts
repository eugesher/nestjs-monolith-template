import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthLoginCustomerRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
