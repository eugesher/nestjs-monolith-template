import { ReminderModel } from '../../domain';

export interface IReminderCreateRepositoryPort {
  insert(reminder: ReminderModel): Promise<ReminderModel>;
}

export const REMINDER_CREATE_REPOSITORY_PORT = Symbol('REMINDER_CREATE_REPOSITORY_PORT');
