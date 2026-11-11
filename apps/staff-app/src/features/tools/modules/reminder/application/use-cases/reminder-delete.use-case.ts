import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  REMINDER_DELETE_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
  type IReminderDeleteRepositoryPort,
  type IReminderSummaryPort,
} from '../../outbound';
import { ReminderAccessService } from '../services/reminder-access.service';
import type { IReminderDeleteCommand } from '../interfaces';

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
