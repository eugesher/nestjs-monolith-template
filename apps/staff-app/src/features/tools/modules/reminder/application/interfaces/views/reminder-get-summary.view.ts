import { Nullable } from '@acme-libs/toolkit';

export interface IReminderGetSummaryView {
  pending: number;
  nextDueOn: Nullable<string>;
}
