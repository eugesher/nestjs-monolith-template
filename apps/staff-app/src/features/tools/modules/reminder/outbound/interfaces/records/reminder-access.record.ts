import type { Reminder } from '@acme-staff/common/entities';

export type IReminderAccessRecord = Pick<
  Reminder,
  'id' | 'ownerId' | 'title' | 'body' | 'dueOn' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;
