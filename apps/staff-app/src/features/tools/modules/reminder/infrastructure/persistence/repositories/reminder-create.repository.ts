import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';

import { IReminderDraft, ReminderModel } from '../../../domain';
import { IReminderCreateRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderCreateRepository implements IReminderCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async insert(draft: IReminderDraft): Promise<ReminderModel> {
    const { ownerId, title, body, dueOn, status, version } = draft;
    const result = await this.reminderRepository.insert({
      ownerId,
      title,
      body,
      dueOn,
      status,
      version,
    });
    const [identifier] = result.identifiers as { id: number | string }[];
    const id = String(identifier.id);
    const stored = await this.reminderRepository
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
      .where('Reminder.id = :id', { id })
      .getOneOrFail();

    return ReminderModel.reconstitute({
      id: stored.id,
      ownerId: stored.ownerId,
      title: stored.title,
      body: stored.body,
      dueOn: stored.dueOn,
      status: stored.status,
      version: stored.version,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    });
  }
}
