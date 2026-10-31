import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';
import { ReminderDomainException, ReminderErrorCodeEnum, ReminderModel } from '../../domain';
import {
  type IReminderWriteRepositoryPort,
  REMINDER_OCC_RETRY_ATTEMPTS,
  REMINDER_WRITE_REPOSITORY_PORT,
} from '../../outbound';
import { ReminderWriteConflictError } from '../errors/reminder-write-conflict.error';
import { IReminderWriteCommand } from '../interfaces/commands/reminder-write.command';
import { ReminderAccessService } from './reminder-access.service';

@Injectable()
export class ReminderWriteService {
  constructor(
    private readonly accessService: ReminderAccessService,
    @Inject(REMINDER_WRITE_REPOSITORY_PORT)
    private readonly repository: IReminderWriteRepositoryPort,
    @Inject(REMINDER_OCC_RETRY_ATTEMPTS)
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
        throw new ReminderDomainException(
          ReminderErrorCodeEnum.REMINDER_VERSION_MISMATCH,
          `Reminder ${reminderId} write lost the optimistic race after ${attempts} attempts`,
          { currentVersion: conflict.currentVersion },
        );
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

    const updated = await this.repository.update({ reminder, versionAsRead });

    if (!updated) {
      const current = await this.load(reminderId);

      throw new ReminderWriteConflictError(reminderId, current.version);
    }

    return await this.load(reminderId);
  }

  private async load(reminderId: string): Promise<ReminderModel> {
    const reminder = await this.repository.findById(reminderId);

    if (reminder === null) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_NOT_FOUND,
        `Reminder ${reminderId} was not found`,
      );
    }

    return reminder;
  }
}
