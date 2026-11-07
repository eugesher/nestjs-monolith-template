import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ReminderModel } from '../../domain';
import {
  REMINDER_CREATE_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
  type IReminderCreateRepositoryPort,
  type IReminderSummaryPort,
} from '../../outbound';
import { IReminderCreateCommand, IReminderView } from '../interfaces';

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
    const draft = ReminderModel.createDraft({ ownerId, title, body: body ?? '', dueOn });
    const reminderId = await this.repository.insert(draft);
    const record = await this.repository.findInserted(reminderId);
    const created = ReminderModel.reconstitute(record);

    await this.summary.invalidate(ownerId);

    const view = created.toView();

    this.logger.info({ reminderId: view.id, ownerId }, 'Reminder created');

    return view;
  }
}
