import { RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
