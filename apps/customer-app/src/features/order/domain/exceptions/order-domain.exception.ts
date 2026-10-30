import { DomainException, Maybe } from '@acme-libs/toolkit';
import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';

export class OrderDomainException extends DomainException {
  public readonly code: OrderErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: OrderErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
