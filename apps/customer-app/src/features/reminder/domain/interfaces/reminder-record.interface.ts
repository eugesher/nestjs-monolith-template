import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderRecord {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
