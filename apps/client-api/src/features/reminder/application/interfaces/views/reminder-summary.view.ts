import { Nullable } from '@acme-libs/toolkit';

export interface IReminderSummaryView {
  pending: number;
  nextDueOn: Nullable<string>;
}
