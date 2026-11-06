import { DomainException, Maybe } from '@acme-libs/toolkit';

import { ReminderExceptionCodeEnum } from '../../enums/reminder-exception-code.enum';

export abstract class ReminderBaseException extends DomainException {
  public abstract override readonly code: ReminderExceptionCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
