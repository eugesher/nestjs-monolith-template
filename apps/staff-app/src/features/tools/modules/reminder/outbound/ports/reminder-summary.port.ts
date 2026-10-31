import { IReminderSummaryReadQuery, IReminderSummarySnapshotView } from '../interfaces';

export interface IReminderSummaryPort {
  read(query: IReminderSummaryReadQuery): Promise<IReminderSummarySnapshotView>;
  invalidate(ownerId: string): Promise<void>;
}

export const REMINDER_SUMMARY_PORT = Symbol('REMINDER_SUMMARY_PORT');
