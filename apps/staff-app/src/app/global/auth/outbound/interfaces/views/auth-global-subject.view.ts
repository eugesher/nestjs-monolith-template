import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthGlobalSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
