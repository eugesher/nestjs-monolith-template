import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

export interface IIdentityCoreUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  roles: RoleEnum[];
}
