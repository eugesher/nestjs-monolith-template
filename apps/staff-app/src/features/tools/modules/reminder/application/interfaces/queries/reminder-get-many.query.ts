import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

export interface IReminderGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
  ownerId: string;
  status: Maybe<ReminderStatusEnum>;
}
