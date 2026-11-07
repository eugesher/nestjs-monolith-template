import { IReminderCreateInsertQuery, IReminderCreateRecord } from '../interfaces';

export interface IReminderCreateRepositoryPort {
  insert(query: IReminderCreateInsertQuery): Promise<string>;
  findInserted(reminderId: string): Promise<IReminderCreateRecord>;
}

export const REMINDER_CREATE_REPOSITORY_PORT = Symbol('REMINDER_CREATE_REPOSITORY_PORT');
