import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import { IReminderDeleteRepositoryPort, REMINDER_DELETE_REPOSITORY_PORT } from '../../../outbound';
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminderRepository.softDelete({ id: reminderId });
  }
}
