import type { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderRecordInput {
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
