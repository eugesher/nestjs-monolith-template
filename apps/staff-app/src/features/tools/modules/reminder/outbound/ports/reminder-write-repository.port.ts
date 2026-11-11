import type { Nullable } from '@acme-libs/toolkit';

import type { IReminderWriteRecord, IReminderWriteUpdateQuery } from '../interfaces';

export interface IReminderWriteRepositoryPort {
  findById(reminderId: string): Promise<Nullable<IReminderWriteRecord>>;
  update(query: IReminderWriteUpdateQuery): Promise<boolean>;
}

export const REMINDER_WRITE_REPOSITORY_PORT = Symbol('REMINDER_WRITE_REPOSITORY_PORT');
