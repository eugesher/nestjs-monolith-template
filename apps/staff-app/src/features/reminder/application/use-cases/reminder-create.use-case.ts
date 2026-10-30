import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ReminderModel } from '../../domain';
import {
  type IReminderCreateRepositoryPort,
  type IReminderSummaryPort,
  REMINDER_CREATE_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
} from '../../outbound';
import { IReminderCreateCommand, IReminderView } from '../interfaces';
import { ReminderViewMapper } from '../mappers/reminder-view.mapper';

@Injectable()
export class ReminderCreateUseCase {
  constructor(
    @Inject(REMINDER_CREATE_REPOSITORY_PORT)
    private readonly repository: IReminderCreateRepositoryPort,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
    @InjectPinoLogger(ReminderCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IReminderCreateCommand): Promise<IReminderView> {
    const { ownerId, title, body, dueOn } = command;
    const reminder = ReminderModel.create({ ownerId, title, body: body ?? '', dueOn });
    const created = await this.repository.insert(reminder);

    await this.summary.invalidate(ownerId);

    const view = ReminderViewMapper.toView(created);

    this.logger.info({ reminderId: view.id, ownerId }, 'Reminder created');

    return view;
  }
}
