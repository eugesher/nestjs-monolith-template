import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IReminderDeleteRepositoryPort } from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderDeleteRepository
  extends ReminderPersistenceHost
  implements IReminderDeleteRepositoryPort
{
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
