import { RoleEnum } from '@acme-libs/kernel';

export interface IIamStaffUserRegistration {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
