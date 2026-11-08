import { RoleEnum } from '@acme-libs/kernel';

export interface IUserStaffUserCandidateInput {
  email: string;
  passwordHash: string;
  roles: RoleEnum[];
}
