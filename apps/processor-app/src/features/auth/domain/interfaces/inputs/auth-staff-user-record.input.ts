import { UserStatusEnum } from '@acme-libs/kernel';

export interface IAuthStaffUserRecordInput {
  id: string;
  passwordHash: string;
  status: UserStatusEnum;
}
