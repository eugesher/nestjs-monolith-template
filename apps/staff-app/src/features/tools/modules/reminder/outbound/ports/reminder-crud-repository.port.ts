import { IPage } from '@acme-libs/toolkit';
import { ReminderModel } from '../../domain';
import { IReminderPageQuery } from '../interfaces';

export interface IReminderCrudRepositoryPort {
  list(query: IReminderPageQuery): Promise<IPage<ReminderModel>>;
}

export const REMINDER_CRUD_REPOSITORY_PORT = Symbol('REMINDER_CRUD_REPOSITORY_PORT');
