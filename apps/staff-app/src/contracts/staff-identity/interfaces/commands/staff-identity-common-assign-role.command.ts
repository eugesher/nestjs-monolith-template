import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
