import { DomainException, type Maybe } from '@acme-libs/toolkit';

import type { OrderExceptionCodeEnum } from '../../enums/order-exception-code.enum';

export abstract class OrderBaseException extends DomainException {
  public abstract override readonly code: OrderExceptionCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
