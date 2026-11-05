import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

export interface IReminderGetManyListQuery {
  page: number;
  limit: number;
  offset: number;
  ownerId: string;
  status: Maybe<ReminderStatusEnum>;
}
