import type { ReminderStatusEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';

export interface IReminderGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
  ownerId: string;
  status: Maybe<ReminderStatusEnum>;
}
