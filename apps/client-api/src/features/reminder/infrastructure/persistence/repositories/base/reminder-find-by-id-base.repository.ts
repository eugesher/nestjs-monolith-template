import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../../../domain';
import { ReminderMapper } from '../../mappers/reminder.mapper';

export abstract class ReminderFindByIdBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async findById(reminderId: string): Promise<Nullable<ReminderModel>> {
    const reminder = await this.reminders.findOne({ where: { id: reminderId } });

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }
}
