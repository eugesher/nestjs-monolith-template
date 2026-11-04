import { Reminder } from '@acme-staff/common/entities';

export type IReminderWriteRecord = Pick<
  Reminder,
  'id' | 'ownerId' | 'title' | 'body' | 'dueOn' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
