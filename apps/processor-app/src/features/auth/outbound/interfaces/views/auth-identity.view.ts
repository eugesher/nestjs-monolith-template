import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthIdentityUserView {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
