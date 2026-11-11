import type { Reminder } from '@acme-staff/common/entities';

export interface IReminderWriteUpdateQuery extends Pick<
  Reminder,
  'id' | 'dueOn' | 'status' | 'version'
> {
  versionAsRead: number;
}
