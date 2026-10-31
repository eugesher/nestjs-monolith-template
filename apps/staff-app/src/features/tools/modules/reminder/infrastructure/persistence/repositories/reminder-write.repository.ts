import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ReminderModel } from '../../../domain';
import { type IReminderWriteRepositoryPort, IReminderWriteUpdateCommand } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderWriteRepository implements IReminderWriteRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async findById(reminderId: string): Promise<Nullable<ReminderModel>> {
    const reminder = await this.reminders.findOne({ where: { id: reminderId } });

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }

  public async update(command: IReminderWriteUpdateCommand): Promise<boolean> {
    const { reminder, versionAsRead } = command;
    const result = await this.reminders.update(
      { id: reminder.id, version: versionAsRead },
      { dueOn: reminder.dueOn, status: reminder.status, version: reminder.version },
    );

    return result.affected === 1;
  }
}
