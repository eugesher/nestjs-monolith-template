import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

export interface IReminderPageQuery {
  page: number;
  limit: number;
  offset: number;
  ownerId: string;
  status: Maybe<ReminderStatusEnum>;
}
