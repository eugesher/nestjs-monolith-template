import { ReminderErrorCodeEnum } from '../enums/reminder-error-code.enum';
import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderTitleInvalidException extends ReminderBaseException {
  public readonly code = ReminderErrorCodeEnum.REMINDER_TITLE_INVALID;

  constructor(
    maxLength: number,
    message = `Reminder.title must be a non-empty string of at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
