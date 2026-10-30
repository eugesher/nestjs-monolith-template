import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthGlobalCustomerView {
  id: string;
  email: string;
  status: UserStatusEnum;
}
