import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { type IReminderWriteRepositoryPort, IReminderWriteUpdateCommand } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderWriteRepository implements IReminderWriteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findById(reminderId: string): Promise<Nullable<ReminderModel>> {
    const reminder = await this.reminderRepository
      .createQueryBuilder('Reminder')
      .select([
        'Reminder.id',
        'Reminder.ownerId',
        'Reminder.title',
        'Reminder.body',
        'Reminder.dueOn',
        'Reminder.status',
        'Reminder.version',
        'Reminder.createdAt',
        'Reminder.updatedAt',
      ])
      .where('Reminder.id = :reminderId', { reminderId })
      .getOne();

    return reminder === null ? null : ReminderMapper.toModel(reminder);
  }

  public async update(command: IReminderWriteUpdateCommand): Promise<boolean> {
    const { reminder, versionAsRead } = command;
    const result = await this.reminderRepository.update(
      { id: reminder.id, version: versionAsRead },
      { dueOn: reminder.dueOn, status: reminder.status, version: reminder.version },
    );

    return result.affected === 1;
  }
}
