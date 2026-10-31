import { RoleEnum } from '@acme-libs/kernel';

export interface IUserAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
