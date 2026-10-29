import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
