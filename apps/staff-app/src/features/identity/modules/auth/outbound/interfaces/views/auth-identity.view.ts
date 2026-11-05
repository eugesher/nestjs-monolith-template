import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthIdentitySubjectView {
  id: string;
  email: string;
  roles: RoleEnum[];
}

export interface IAuthIdentityUserView {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
}
