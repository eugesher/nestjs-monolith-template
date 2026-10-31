import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  type IReminderDeleteRepositoryPort,
  type IReminderSummaryPort,
  REMINDER_DELETE_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
} from '../../outbound';
import { IReminderDeleteCommand } from '../interfaces';
import { ReminderAccessService } from '../services/reminder-access.service';

@Injectable()
export class ReminderDeleteUseCase {
  constructor(
    private readonly accessService: ReminderAccessService,
    @Inject(REMINDER_DELETE_REPOSITORY_PORT)
    private readonly repository: IReminderDeleteRepositoryPort,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
    @InjectPinoLogger(ReminderDeleteUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IReminderDeleteCommand): Promise<void> {
    const { reminderId, ownerId } = command;

    await this.accessService.loadOwned({ reminderId, ownerId });
    await this.repository.softDelete(reminderId);
    await this.summary.invalidate(ownerId);

    this.logger.info({ reminderId }, 'Reminder deleted');
  }
}
