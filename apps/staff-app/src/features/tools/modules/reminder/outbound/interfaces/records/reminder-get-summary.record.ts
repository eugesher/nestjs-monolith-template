import type { Nullable } from '@acme-libs/toolkit';

export interface IReminderGetSummaryRecord {
  pending: number | string;
  nextDueOn: Nullable<string>;
}
