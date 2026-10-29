import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthCurrentUserView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
