import { IReminderListedRecord, IReminderPageQuery } from '../interfaces';

export interface IReminderGetManyRepositoryPort {
  list(query: IReminderPageQuery): Promise<[IReminderListedRecord[], number]>;
}

export const REMINDER_GET_MANY_REPOSITORY_PORT = Symbol('REMINDER_GET_MANY_REPOSITORY_PORT');
