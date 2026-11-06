import { ReminderExceptionCodeEnum } from '../enums/reminder-exception-code.enum';
import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderVersionInvalidException extends ReminderBaseException {
  public readonly code = ReminderExceptionCodeEnum.REMINDER_VERSION_INVALID;

  constructor(
    version: number,
    message = `Reminder.version must be a positive integer, got ${version}`,
  ) {
    super(message);
  }
}
