import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthIdentityUserView {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
