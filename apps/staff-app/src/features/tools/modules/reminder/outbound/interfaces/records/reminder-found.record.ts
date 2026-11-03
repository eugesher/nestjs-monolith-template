import { ReminderStatusEnum } from '@acme-libs/kernel';

export interface IReminderFoundRecord {
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
