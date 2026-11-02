import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderDraft {
  ownerId: string;
  title: string;
  body: string;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
}
