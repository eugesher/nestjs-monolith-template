import { DomainException, Maybe } from '@acme-libs/toolkit';
import { ReminderErrorCodeEnum } from '../enums/reminder-error-code.enum';

export class ReminderDomainException extends DomainException {
  public readonly code: ReminderErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: ReminderErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
