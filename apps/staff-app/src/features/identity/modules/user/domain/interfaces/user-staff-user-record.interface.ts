import { UserStatusEnum } from '@acme-libs/kernel';

export interface IUserStaffUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  userRoles: { role: { name: string } }[];
}
