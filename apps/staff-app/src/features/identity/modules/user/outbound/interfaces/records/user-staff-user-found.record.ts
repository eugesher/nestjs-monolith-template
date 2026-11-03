import { UserStatusEnum } from '@acme-libs/kernel';

interface IUserStaffUserFoundRecordRole {
  name: string;
}

interface IUserStaffUserFoundRecordUserRole {
  role: IUserStaffUserFoundRecordRole;
}

export interface IUserStaffUserFoundRecord {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatusEnum;
  userRoles: IUserStaffUserFoundRecordUserRole[];
}
