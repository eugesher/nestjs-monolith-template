import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { type IReminderDeleteRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderDeleteRepository implements IReminderDeleteRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminders.softDelete({ id: reminderId });
  }
}
