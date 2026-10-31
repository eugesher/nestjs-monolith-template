import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../domain';
import { IReminderAccessFindOwnedQuery } from '../interfaces';

export interface IReminderAccessRepositoryPort {
  findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<ReminderModel>>;
}

export const REMINDER_ACCESS_REPOSITORY_PORT = Symbol('REMINDER_ACCESS_REPOSITORY_PORT');
