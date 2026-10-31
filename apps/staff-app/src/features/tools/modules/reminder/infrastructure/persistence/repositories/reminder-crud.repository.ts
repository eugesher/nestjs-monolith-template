import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { ReminderModel } from '../../../domain';
import { type IReminderCrudRepositoryPort, IReminderPageQuery } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderCrudRepository implements IReminderCrudRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async list(query: IReminderPageQuery): Promise<IPage<ReminderModel>> {
    const { page, size, ownerId, status } = query;
    const byStatus = status === undefined ? {} : { status };
    const [reminders, total] = await this.reminders.findAndCount({
      where: { ownerId, ...byStatus },
      order: { dueOn: 'ASC', id: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: reminders.map((reminder) => ReminderMapper.toModel(reminder)),
      total,
      page,
      size,
    };
  }
}
