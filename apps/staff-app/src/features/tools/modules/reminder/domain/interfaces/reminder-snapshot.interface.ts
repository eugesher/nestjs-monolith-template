import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderSnapshot {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  dueOn: string;
  status: ReminderStatusEnum;
  version: number;
  createdAt: string;
  updatedAt: string;
}
