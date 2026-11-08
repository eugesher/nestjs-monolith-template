import { UserStatusEnum } from '@acme-libs/kernel';

export interface IUserStaffUserDraftOutput {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  roles: string[];
}
