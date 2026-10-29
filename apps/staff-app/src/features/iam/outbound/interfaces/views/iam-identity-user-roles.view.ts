import { RoleEnum } from '@acme-libs/kernel';

export interface IIamIdentityUserRolesView {
  id: string;
  roles: RoleEnum[];
}
