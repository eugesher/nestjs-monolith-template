import { ReminderExceptionCodeEnum } from '../enums/reminder-exception-code.enum';

import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderAlreadyDoneException extends ReminderBaseException {
  public readonly code = ReminderExceptionCodeEnum.REMINDER_ALREADY_DONE;

  constructor(reminderId: string, message = `Reminder ${reminderId} is already done`) {
    super(message);
  }
}
