import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthCommonStaffUserRecord {
  id: string;
  email: string;
  status: UserStatusEnum;
  roles: RoleEnum[];
}
