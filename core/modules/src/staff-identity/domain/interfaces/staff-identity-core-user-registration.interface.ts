import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreUserRegistration {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
