import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { Reminder } from '@acme-staff/common/entities';

import { type IReminderDeleteRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderDeleteRepository implements IReminderDeleteRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminderRepository.softDelete({ id: reminderId });
  }
}
