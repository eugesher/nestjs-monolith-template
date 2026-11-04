import { IReminderFoundRecord, IReminderInsertQuery } from '../interfaces';

export interface IReminderCreateRepositoryPort {
  insert(query: IReminderInsertQuery): Promise<string>;
  findInserted(reminderId: string): Promise<IReminderFoundRecord>;
}

export const REMINDER_CREATE_REPOSITORY_PORT = Symbol('REMINDER_CREATE_REPOSITORY_PORT');
