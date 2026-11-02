import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';

import { OrderBaseException } from './base/order-base.exception';

export class OrderNotFoundException extends OrderBaseException {
  public readonly code = OrderErrorCodeEnum.ORDER_NOT_FOUND;

  constructor(orderId: string, message = `Order ${orderId} was not found`) {
    super(message);
  }
}
