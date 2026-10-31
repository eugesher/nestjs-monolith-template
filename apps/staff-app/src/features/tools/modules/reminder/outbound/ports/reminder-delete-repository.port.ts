export interface IReminderDeleteRepositoryPort {
  softDelete(reminderId: string): Promise<void>;
}

export const REMINDER_DELETE_REPOSITORY_PORT = Symbol('REMINDER_DELETE_REPOSITORY_PORT');
