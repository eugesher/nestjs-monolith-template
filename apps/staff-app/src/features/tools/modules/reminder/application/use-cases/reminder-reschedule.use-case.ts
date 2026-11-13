import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { REMINDER_SUMMARY_PORT, type IReminderSummaryPort } from '../../outbound';
import { ReminderWriteService } from '../services/reminder-write.service';
import type { IReminderRescheduleCommand, IReminderView } from '../interfaces';

@Injectable()
export class ReminderRescheduleUseCase {
  constructor(
    private readonly writeService: ReminderWriteService,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
    @InjectPinoLogger(ReminderRescheduleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IReminderRescheduleCommand): Promise<IReminderView> {
    const { reminderId, ownerId, dueOn } = command;
    const writtenReminder = await this.writeService.write({ reminderId, ownerId }, (reminder) =>
      reminder.reschedule(dueOn),
    );

    await this.summary.invalidate(ownerId);

    const reminderView = writtenReminder.toSnapshot();

    this.logger.info(
      { reminderId, dueOn: reminderView.dueOn, version: reminderView.version },
      'Reminder rescheduled',
    );

    return reminderView;
  }
}
