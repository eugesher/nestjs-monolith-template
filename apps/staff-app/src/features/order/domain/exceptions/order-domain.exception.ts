import { DomainException } from '@acme-libs/toolkit';
import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';

export class OrderDomainException extends DomainException {
  public readonly code: OrderErrorCodeEnum;

  constructor(code: OrderErrorCodeEnum, message: string) {
    super(message);
    this.code = code;
  }
}
