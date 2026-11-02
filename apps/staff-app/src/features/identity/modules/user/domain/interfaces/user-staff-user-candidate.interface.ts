import { RoleEnum } from '@acme-libs/kernel';

export interface IUserStaffUserCandidate {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
