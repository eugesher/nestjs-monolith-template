import { UserStatusEnum } from '@acme-libs/kernel';

interface IUserStaffUserRecordRole {
  name: string;
}

interface IUserStaffUserRecordUserRole {
  role: IUserStaffUserRecordRole;
}

export interface IUserStaffUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  userRoles: IUserStaffUserRecordUserRole[];
}
