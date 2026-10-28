import { RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreUserRegistration {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
