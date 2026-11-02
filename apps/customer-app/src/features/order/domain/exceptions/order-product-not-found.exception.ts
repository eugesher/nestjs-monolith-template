import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';

import { OrderBaseException } from './base/order-base.exception';

export class OrderProductNotFoundException extends OrderBaseException {
  public readonly code = OrderErrorCodeEnum.ORDER_PRODUCT_NOT_FOUND;

  constructor(productId: string, message = `Product ${productId} was not found`) {
    super(message, { productId });
  }
}
