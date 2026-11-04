import { Maybe } from '@acme-libs/toolkit';

import { IReminderGetSummaryRecord } from '../interfaces';

export interface IReminderGetSummaryRepositoryPort {
  summarize(ownerId: string): Promise<Maybe<IReminderGetSummaryRecord>>;
}

export const REMINDER_GET_SUMMARY_REPOSITORY_PORT = Symbol('REMINDER_GET_SUMMARY_REPOSITORY_PORT');
