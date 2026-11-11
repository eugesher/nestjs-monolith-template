import type { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerDraftOutput {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
