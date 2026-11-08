import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderSnapshotOutput {
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
