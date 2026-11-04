import { Nullable } from '@acme-libs/toolkit';

export interface IReminderSummarySnapshotRecord {
  pending: number;
  nextDueOn: Nullable<string>;
}
