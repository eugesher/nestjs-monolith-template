import { Nullable } from '@acme-libs/toolkit';

import { IReminderAccessFindOwnedQuery, IReminderAccessRecord } from '../interfaces';

export interface IReminderAccessRepositoryPort {
  findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<IReminderAccessRecord>>;
}

export const REMINDER_ACCESS_REPOSITORY_PORT = Symbol('REMINDER_ACCESS_REPOSITORY_PORT');
