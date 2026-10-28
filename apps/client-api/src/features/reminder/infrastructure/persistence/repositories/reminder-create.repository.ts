import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { ReminderModel } from '../../../domain';
import { type IReminderCreateRepositoryPort } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderCreateRepository implements IReminderCreateRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async insert(reminder: ReminderModel): Promise<ReminderModel> {
    const { ownerId, title, body, dueOn, status, version } = reminder;
    const draft = this.reminders.create({ ownerId, title, body, dueOn, status, version });
    const saved = await this.reminders.save(draft);
    const stored = await this.reminders.findOneOrFail({ where: { id: String(saved.id) } });

    return ReminderMapper.toModel(stored);
  }
}
