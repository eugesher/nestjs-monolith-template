import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCustomerDraft {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
