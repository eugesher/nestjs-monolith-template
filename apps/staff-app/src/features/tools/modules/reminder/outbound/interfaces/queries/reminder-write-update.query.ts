import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderWriteUpdateQuery {
  id: string;
  versionAsRead: number;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
}
