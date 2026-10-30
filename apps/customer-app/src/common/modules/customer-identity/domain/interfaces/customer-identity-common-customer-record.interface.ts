import { UserStatusEnum } from '@acme-libs/kernel';

export interface ICustomerIdentityCommonCustomerRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
