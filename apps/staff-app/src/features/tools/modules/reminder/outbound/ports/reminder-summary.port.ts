import { IReminderSummaryReadCommand, IReminderSummarySnapshotView } from '../interfaces';

export interface IReminderSummaryPort {
  read(command: IReminderSummaryReadCommand): Promise<IReminderSummarySnapshotView>;
  invalidate(ownerId: string): Promise<void>;
}

export const REMINDER_SUMMARY_PORT = Symbol('REMINDER_SUMMARY_PORT');
