import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';

import { IReminderDeleteRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderDeleteRepository implements IReminderDeleteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminderRepository.softDelete({ id: reminderId });
  }
}
