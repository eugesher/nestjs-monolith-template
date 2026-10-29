import { RoleEnum } from '@acme-libs/kernel';

export interface IIamIdentityAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
