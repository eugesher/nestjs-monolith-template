import { UserStatusEnum } from '@acme-libs/kernel';

export interface IStaffAuthCoreUserView {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
