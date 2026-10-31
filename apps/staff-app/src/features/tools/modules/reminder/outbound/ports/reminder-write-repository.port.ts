import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../domain';
import { IReminderWriteUpdateCommand } from '../interfaces';

export interface IReminderWriteRepositoryPort {
  findById(reminderId: string): Promise<Nullable<ReminderModel>>;
  update(command: IReminderWriteUpdateCommand): Promise<boolean>;
}

export const REMINDER_WRITE_REPOSITORY_PORT = Symbol('REMINDER_WRITE_REPOSITORY_PORT');
