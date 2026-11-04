import { IReminderGetManyRecord, IReminderGetManyListQuery } from '../interfaces';

export interface IReminderGetManyRepositoryPort {
  list(query: IReminderGetManyListQuery): Promise<IReminderGetManyRecord>;
}

export const REMINDER_GET_MANY_REPOSITORY_PORT = Symbol('REMINDER_GET_MANY_REPOSITORY_PORT');
