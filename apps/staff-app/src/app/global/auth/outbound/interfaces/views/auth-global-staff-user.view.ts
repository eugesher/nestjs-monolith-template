import { RoleEnum } from '@acme-libs/kernel';

export interface IAuthGlobalStaffUserView {
  id: string;
  email: string;
  roles: RoleEnum[];
}
