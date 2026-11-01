import { RoleEnum } from '@acme-libs/kernel';

export interface IUserRegisterCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
