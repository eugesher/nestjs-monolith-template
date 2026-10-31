import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { type IReminderDeleteRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderDeleteRepository implements IReminderDeleteRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.transactionHost.tx.getRepository(Reminder);
  }

  public async softDelete(reminderId: string): Promise<void> {
    await this.reminderRepository.softDelete({ id: reminderId });
  }
}
