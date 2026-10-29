import { RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
