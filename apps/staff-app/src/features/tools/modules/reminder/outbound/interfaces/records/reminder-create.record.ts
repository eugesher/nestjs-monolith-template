import type { Reminder } from '@acme-staff/common/entities';

export type IReminderCreateRecord = Pick<
  Reminder,
  'id' | 'ownerId' | 'title' | 'body' | 'dueOn' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
