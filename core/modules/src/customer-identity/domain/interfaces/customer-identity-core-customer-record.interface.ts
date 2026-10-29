import { UserStatusEnum } from '@acme-libs/kernel';

export interface ICustomerIdentityCoreCustomerRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
