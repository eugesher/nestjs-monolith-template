import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonUserRegistration {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
