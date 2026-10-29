import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreRegisterUserCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
