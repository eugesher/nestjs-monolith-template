import { IReminderDraft, ReminderModel } from '../../domain';

export interface IReminderCreateRepositoryPort {
  insert(draft: IReminderDraft): Promise<ReminderModel>;
}

export const REMINDER_CREATE_REPOSITORY_PORT = Symbol('REMINDER_CREATE_REPOSITORY_PORT');
