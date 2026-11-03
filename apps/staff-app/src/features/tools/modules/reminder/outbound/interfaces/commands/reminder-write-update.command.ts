import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderWriteUpdateCommand {
  id: string;
  versionAsRead: number;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
}
