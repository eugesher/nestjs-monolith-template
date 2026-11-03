import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerFoundRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
