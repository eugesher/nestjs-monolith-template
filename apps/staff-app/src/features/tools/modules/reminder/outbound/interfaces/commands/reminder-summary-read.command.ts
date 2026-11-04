import { IReminderSummarySnapshotView } from '../views/reminder-summary-snapshot.view';

export interface IReminderSummaryReadCommand {
  ownerId: string;
  compute: () => Promise<IReminderSummarySnapshotView>;
}
