import { DomainException, Maybe } from '@acme-libs/toolkit';

import { ReminderErrorCodeEnum } from '../../enums/reminder-error-code.enum';

export abstract class ReminderBaseException extends DomainException {
  public abstract override readonly code: ReminderErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
