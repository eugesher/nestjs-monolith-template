import { Reminder } from '@acme-staff/common/entities';

type IReminderGetManyRecordItem = Pick<
  Reminder,
  'id' | 'ownerId' | 'title' | 'body' | 'dueOn' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;

export type IReminderGetManyRecord = [IReminderGetManyRecordItem[], number];
