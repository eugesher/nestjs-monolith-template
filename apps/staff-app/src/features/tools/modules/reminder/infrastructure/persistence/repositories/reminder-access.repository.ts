import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../../domain';
import {
  IReminderAccessFindOwnedQuery,
  type IReminderAccessRepositoryPort,
} from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderAccessRepository implements IReminderAccessRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<ReminderModel>> {
    const { reminderId, ownerId } = query;
    const reminder = await this.reminders.findOne({ where: { id: reminderId, ownerId } });

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }
}
