import { Reminder } from '@acme-staff/common/entities';

export type IReminderCreateInsertQuery = Pick<
  Reminder,
  'ownerId' | 'title' | 'body' | 'dueOn' | 'status' | 'version'
>;
