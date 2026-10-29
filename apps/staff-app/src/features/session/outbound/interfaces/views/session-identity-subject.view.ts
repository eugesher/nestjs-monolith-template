import { RoleEnum } from '@acme-libs/kernel';

export interface ISessionIdentitySubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
