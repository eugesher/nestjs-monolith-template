import { ReminderErrorCodeEnum } from '../enums/reminder-error-code.enum';

import { ReminderBaseException } from './base/reminder-base.exception';

export class ReminderNotFoundException extends ReminderBaseException {
  public readonly code = ReminderErrorCodeEnum.REMINDER_NOT_FOUND;

  constructor(reminderId: string, message = `Reminder ${reminderId} was not found`) {
    super(message);
  }
}
