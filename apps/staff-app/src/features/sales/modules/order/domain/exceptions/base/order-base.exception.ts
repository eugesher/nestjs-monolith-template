import { DomainException, Maybe } from '@acme-libs/toolkit';

import { OrderErrorCodeEnum } from '../../enums/order-error-code.enum';

export abstract class OrderBaseException extends DomainException {
  public abstract override readonly code: OrderErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
