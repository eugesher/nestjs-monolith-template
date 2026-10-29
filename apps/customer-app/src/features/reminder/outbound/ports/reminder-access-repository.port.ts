import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../domain';

export interface IReminderAccessRepositoryPort {
  findById(reminderId: string): Promise<Nullable<ReminderModel>>;
}

export const REMINDER_ACCESS_REPOSITORY_PORT = Symbol('REMINDER_ACCESS_REPOSITORY_PORT');
