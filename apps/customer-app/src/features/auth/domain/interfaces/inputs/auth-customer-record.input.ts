import type { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerRecordInput {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
