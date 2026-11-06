import { ReminderExceptionCodeEnum } from '../enums/reminder-exception-code.enum';
import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderVersionMismatchException extends ReminderBaseException {
  public readonly code = ReminderExceptionCodeEnum.REMINDER_VERSION_MISMATCH;

  constructor(
    reminderId: string,
    attempts: number,
    currentVersion: number,
    message = `Reminder ${reminderId} write lost the optimistic race after ${attempts} attempts`,
  ) {
    super(message, { currentVersion });
  }
}
