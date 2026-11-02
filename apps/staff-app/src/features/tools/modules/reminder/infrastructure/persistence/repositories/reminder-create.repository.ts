import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { type IReminderCreateRepositoryPort } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderCreateRepository implements IReminderCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async insert(reminder: ReminderModel): Promise<ReminderModel> {
    const { ownerId, title, body, dueOn, status, version } = reminder;
    const draft = this.reminderRepository.create({ ownerId, title, body, dueOn, status, version });
    const saved = await this.reminderRepository.save(draft);
    const stored = await this.reminderRepository.findOneOrFail({ where: { id: String(saved.id) } });

    return ReminderMapper.toModel(stored);
  }
}
