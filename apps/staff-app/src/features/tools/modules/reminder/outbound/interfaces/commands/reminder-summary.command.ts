import { IReminderSummarySnapshotView } from '../views/reminder-summary.view';

export interface IReminderSummaryReadCommand {
  ownerId: string;
  compute: () => Promise<IReminderSummarySnapshotView>;
}
