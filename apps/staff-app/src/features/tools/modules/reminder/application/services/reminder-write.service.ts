import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';

import {
  ReminderModel,
  ReminderNotFoundException,
  ReminderVersionMismatchException,
} from '../../domain';
import {
  REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
  REMINDER_WRITE_REPOSITORY_PORT,
  type IReminderWriteRepositoryPort,
} from '../../outbound';
import { ReminderWriteConflictError } from '../errors/reminder-write-conflict.error';
import { ReminderAccessService } from './reminder-access.service';
import type { IReminderWriteCommand } from '../interfaces';

@Injectable()
export class ReminderWriteService {
  constructor(
    private readonly accessService: ReminderAccessService,
    @Inject(REMINDER_WRITE_REPOSITORY_PORT)
    private readonly repository: IReminderWriteRepositoryPort,
    @Inject(REMINDER_OCC_RETRY_ATTEMPTS_TOKEN)
    private readonly occRetryAttempts: number,
    @InjectPinoLogger(ReminderWriteService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async write(
    command: IReminderWriteCommand,
    mutate: (reminder: ReminderModel) => void,
  ): Promise<ReminderModel> {
    const { reminderId } = command;

    return await OccRetryHelper.run(() => this.attempt(command, mutate), {
      subject: 'Reminder',
      logger: this.logger,
      maxAttempts: this.occRetryAttempts,
      isConflict: (error): error is ReminderWriteConflictError =>
        error instanceof ReminderWriteConflictError,
      retryContext: (conflict) => ({ reminderId, currentVersion: conflict.currentVersion }),
      exhaustedContext: () => ({ reminderId }),
      onExhausted: (conflict, attempts) => {
        throw new ReminderVersionMismatchException(reminderId, attempts, conflict.currentVersion);
      },
    });
  }

  private async attempt(
    command: IReminderWriteCommand,
    mutate: (reminder: ReminderModel) => void,
  ): Promise<ReminderModel> {
    const { reminderId, ownerId } = command;
    const reminder = await this.accessService.loadOwned({ reminderId, ownerId });
    const versionAsRead = reminder.version;

    mutate(reminder);

    if (reminder.version === versionAsRead) {
      return reminder;
    }

    const isUpdated = await this.repository.update({
      id: reminder.id,
      versionAsRead,
      dueOn: reminder.dueOn,
      status: reminder.status,
      version: reminder.version,
    });

    if (!isUpdated) {
      const currentReminder = await this.load(reminderId);

      throw new ReminderWriteConflictError(reminderId, currentReminder.version);
    }

    return await this.load(reminderId);
  }

  private async load(reminderId: string): Promise<ReminderModel> {
    const reminderRecord = await this.repository.findById(reminderId);

    if (!reminderRecord) {
      throw new ReminderNotFoundException(reminderId);
    }

    return ReminderModel.reconstitute(reminderRecord);
  }
}
