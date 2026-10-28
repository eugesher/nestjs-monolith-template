import { RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreRegisterUserCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
