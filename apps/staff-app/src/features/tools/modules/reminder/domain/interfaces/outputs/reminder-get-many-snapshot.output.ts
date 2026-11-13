import type { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderGetManySnapshotOutput {
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
