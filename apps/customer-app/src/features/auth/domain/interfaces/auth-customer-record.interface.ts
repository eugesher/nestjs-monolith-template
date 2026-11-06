import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerRecord {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
