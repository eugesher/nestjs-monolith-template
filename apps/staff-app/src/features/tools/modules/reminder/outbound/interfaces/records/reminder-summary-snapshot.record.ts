import { Nullable } from '@acme-libs/toolkit';

export interface IReminderSummarySnapshotRecord {
  pending: number | string;
  nextDueOn: Nullable<string>;
}
