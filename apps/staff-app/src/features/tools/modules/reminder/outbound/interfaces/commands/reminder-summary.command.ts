import { IReminderSummarySnapshotView } from '../views/reminder-summary.view';

export interface IReminderSummaryReadCommand {
  ownerId: string;
  ttlMs: number;
  compute: () => Promise<IReminderSummarySnapshotView>;
}
