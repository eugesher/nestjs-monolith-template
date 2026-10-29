import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IReminderSummaryPort, REMINDER_SUMMARY_PORT } from '../../outbound';
import { IReminderRescheduleCommand, IReminderView } from '../interfaces';
import { ReminderViewMapper } from '../mappers/reminder-view.mapper';
import { ReminderWriteService } from '../services/reminder-write.service';

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
    const written = await this.writeService.write({ reminderId, ownerId }, (reminder) =>
      reminder.reschedule(dueOn),
    );

    await this.summary.invalidate(ownerId);

    const view = ReminderViewMapper.toView(written);

    this.logger.info(
      { reminderId, dueOn: view.dueOn, version: view.version },
      'Reminder rescheduled',
    );

    return view;
  }
}
