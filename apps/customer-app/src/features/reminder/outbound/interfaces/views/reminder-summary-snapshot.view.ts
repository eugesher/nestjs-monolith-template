import { Nullable } from '@acme-libs/toolkit';

export interface IReminderSummarySnapshotView {
  pending: number;
  nextDueOn: Nullable<string>;
}
