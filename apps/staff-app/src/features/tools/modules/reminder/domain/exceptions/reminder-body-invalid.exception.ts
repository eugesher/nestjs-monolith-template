import { ReminderExceptionCodeEnum } from '../enums/reminder-exception-code.enum';
import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderBodyInvalidException extends ReminderBaseException {
  public readonly code = ReminderExceptionCodeEnum.REMINDER_BODY_INVALID;

  constructor(
    maxLength: number,
    message = `Reminder.body must be at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
