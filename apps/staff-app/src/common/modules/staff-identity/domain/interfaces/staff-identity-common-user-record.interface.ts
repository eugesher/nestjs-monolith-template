import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  roles: RoleEnum[];
}
