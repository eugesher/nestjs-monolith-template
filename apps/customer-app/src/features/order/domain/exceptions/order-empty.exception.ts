import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';

import { OrderBaseException } from './base/order-base.exception';

export class OrderEmptyException extends OrderBaseException {
  public readonly code = OrderErrorCodeEnum.ORDER_EMPTY;

  constructor(message = 'An order must contain at least one product') {
    super(message);
  }
}
