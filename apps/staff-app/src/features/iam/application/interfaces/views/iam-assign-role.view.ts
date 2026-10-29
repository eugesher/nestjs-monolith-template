import { RoleEnum } from '@acme-libs/kernel';

export interface IIamAssignRoleView {
  id: string;
  roles: RoleEnum[];
}
