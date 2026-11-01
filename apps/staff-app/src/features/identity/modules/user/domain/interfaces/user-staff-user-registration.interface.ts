import { RoleEnum } from '@acme-libs/kernel';

export interface IUserStaffUserRegistration {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
