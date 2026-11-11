import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  REMINDER_DELETE_REPOSITORY_PORT,
  type IReminderDeleteRepositoryPort,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderDeleteRepository
  extends ReminderPersistenceHost
  implements IReminderDeleteRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderDeleteRepositoryPort> = {
    provide: REMINDER_DELETE_REPOSITORY_PORT,
    useClass: ReminderDeleteRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminderRepository.softDelete({ id: reminderId });
  }
}
