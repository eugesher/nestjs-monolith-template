import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthCommonSubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
