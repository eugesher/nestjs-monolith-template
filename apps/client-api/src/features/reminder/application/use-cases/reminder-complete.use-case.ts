import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IReminderSummaryPort, REMINDER_SUMMARY_PORT } from '../../outbound';
import { IReminderCompleteCommand, IReminderView } from '../interfaces';
import { ReminderViewMapper } from '../mappers/reminder-view.mapper';
import { ReminderWriteService } from '../services/reminder-write.service';

@Injectable()
export class ReminderCompleteUseCase {
  constructor(
    private readonly writeService: ReminderWriteService,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
    @InjectPinoLogger(ReminderCompleteUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IReminderCompleteCommand): Promise<IReminderView> {
    const { reminderId, ownerId } = command;
    const written = await this.writeService.write({ reminderId, ownerId }, (reminder) =>
      reminder.complete(),
    );

    await this.summary.invalidate(ownerId);

    const view = ReminderViewMapper.toView(written);

    this.logger.info({ reminderId, version: view.version }, 'Reminder completed');

    return view;
  }
}
