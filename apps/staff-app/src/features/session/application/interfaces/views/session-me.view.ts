import { RoleEnum } from '@acme-libs/kernel';

export interface ISessionMeView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
