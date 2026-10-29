import { RoleEnum } from '@acme-libs/kernel';

export interface IIamIdentityRegisterUserCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
