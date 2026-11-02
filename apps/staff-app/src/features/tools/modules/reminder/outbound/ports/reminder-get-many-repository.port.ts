import { IPage } from '@acme-libs/toolkit';

import { ReminderModel } from '../../domain';
import { IReminderPageQuery } from '../interfaces';

export interface IReminderGetManyRepositoryPort {
  list(query: IReminderPageQuery): Promise<IPage<ReminderModel>>;
}

export const REMINDER_GET_MANY_REPOSITORY_PORT = Symbol('REMINDER_GET_MANY_REPOSITORY_PORT');
