import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonRegisterUserCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
