import { Nullable } from '@acme-libs/toolkit';

import { IReminderFoundRecord, IReminderWriteUpdateQuery } from '../interfaces';

export interface IReminderWriteRepositoryPort {
  findById(reminderId: string): Promise<Nullable<IReminderFoundRecord>>;
  update(query: IReminderWriteUpdateQuery): Promise<boolean>;
}

export const REMINDER_WRITE_REPOSITORY_PORT = Symbol('REMINDER_WRITE_REPOSITORY_PORT');
