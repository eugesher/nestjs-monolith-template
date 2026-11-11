import type { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthIdentitySubjectView {
  id: string;
  email: string;
  roles: string[];
}

export interface IAuthIdentityUserView {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
