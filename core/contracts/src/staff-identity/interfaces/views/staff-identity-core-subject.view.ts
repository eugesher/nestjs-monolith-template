import { RoleEnum } from '@acme-libs/kernel';

export interface IStaffIdentityCoreSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
