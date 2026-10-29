import { RoleEnum } from '@acme-libs/kernel';

export interface IIamRegisterUserCommand {
  email: string;
  password: string;
  roles: RoleEnum[];
}
