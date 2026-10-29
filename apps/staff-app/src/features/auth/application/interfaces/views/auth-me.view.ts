import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthMeView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
