import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

export interface IUserStaffUserDraft {
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  roles: RoleEnum[];
}
