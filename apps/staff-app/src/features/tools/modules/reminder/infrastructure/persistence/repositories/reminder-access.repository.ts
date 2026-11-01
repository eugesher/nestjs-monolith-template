import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import {
  IReminderAccessFindOwnedQuery,
  type IReminderAccessRepositoryPort,
} from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderAccessRepository implements IReminderAccessRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<ReminderModel>> {
    const { reminderId, ownerId } = query;
    const reminder = await this.reminderRepository.findOne({ where: { id: reminderId, ownerId } });

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }
}
