import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
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
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<ReminderModel>> {
    const { reminderId, ownerId } = query;
    const reminder = await this.reminderRepository.findOne({ where: { id: reminderId, ownerId } });

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }
}
