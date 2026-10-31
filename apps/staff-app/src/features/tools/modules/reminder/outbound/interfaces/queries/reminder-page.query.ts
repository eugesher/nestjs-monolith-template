import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

export interface IReminderPageQuery {
  page: number;
  size: number;
  ownerId: string;
  status: Maybe<ReminderStatusEnum>;
}
