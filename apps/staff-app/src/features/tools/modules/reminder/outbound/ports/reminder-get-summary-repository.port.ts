import { IReminderSummarySnapshotView } from '../interfaces';

export interface IReminderGetSummaryRepositoryPort {
  summarize(ownerId: string): Promise<IReminderSummarySnapshotView>;
}

export const REMINDER_GET_SUMMARY_REPOSITORY_PORT = Symbol('REMINDER_GET_SUMMARY_REPOSITORY_PORT');
