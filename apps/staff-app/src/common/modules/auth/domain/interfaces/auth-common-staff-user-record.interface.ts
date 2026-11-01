import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthCommonStaffUserRecord {
  id: string;
  email: string;
  roles: RoleEnum[];
}
