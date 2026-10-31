import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthIdentitySubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
