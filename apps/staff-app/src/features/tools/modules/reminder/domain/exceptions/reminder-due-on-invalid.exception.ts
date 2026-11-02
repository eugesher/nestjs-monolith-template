import { ReminderErrorCodeEnum } from '../enums/reminder-error-code.enum';
import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderDueOnInvalidException extends ReminderBaseException {
  public readonly code = ReminderErrorCodeEnum.REMINDER_DUE_ON_INVALID;

  constructor(
    dueOn: string,
    message = `Reminder.dueOn must be a calendar date formatted YYYY-MM-DD, got ${dueOn}`,
  ) {
    super(message);
  }
}
