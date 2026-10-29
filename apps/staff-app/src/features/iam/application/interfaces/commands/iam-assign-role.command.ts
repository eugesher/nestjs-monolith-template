import { RoleEnum } from '@acme-libs/kernel';

export interface IIamAssignRoleCommand {
  userId: string;
  role: RoleEnum;
}
