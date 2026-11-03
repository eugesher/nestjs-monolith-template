import { IReminderFoundRecord, IReminderInsertCommand } from '../interfaces';

export interface IReminderCreateRepositoryPort {
  insert(command: IReminderInsertCommand): Promise<string>;
  findInserted(reminderId: string): Promise<IReminderFoundRecord>;
}

export const REMINDER_CREATE_REPOSITORY_PORT = Symbol('REMINDER_CREATE_REPOSITORY_PORT');
