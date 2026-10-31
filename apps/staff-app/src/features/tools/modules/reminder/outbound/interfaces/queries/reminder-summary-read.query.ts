import { IReminderSummarySnapshotView } from '../views/reminder-summary-snapshot.view';

export interface IReminderSummaryReadQuery {
  ownerId: string;
  compute: () => Promise<IReminderSummarySnapshotView>;
}
