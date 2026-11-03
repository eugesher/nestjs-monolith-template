import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderInsertCommand {
  ownerId: string;
  title: string;
  body: string;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
}
