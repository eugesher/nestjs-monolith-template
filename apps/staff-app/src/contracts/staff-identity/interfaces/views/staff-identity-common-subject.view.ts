import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCommonSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
