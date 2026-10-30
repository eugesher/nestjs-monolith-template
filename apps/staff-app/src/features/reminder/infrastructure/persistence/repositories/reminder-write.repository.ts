import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IReminderWriteRepositoryPort, IReminderWriteUpdateCommand } from '../../../outbound';
import { ReminderFindByIdBaseRepository } from './base/reminder-find-by-id-base.repository';

@Injectable()
export class ReminderWriteRepository
  extends ReminderFindByIdBaseRepository
  implements IReminderWriteRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
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
