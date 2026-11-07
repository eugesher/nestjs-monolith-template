import { OrderExceptionCodeEnum } from '../enums/order-exception-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderNotFoundException extends OrderBaseException {
  public readonly code = OrderExceptionCodeEnum.ORDER_NOT_FOUND;

  constructor(orderId: string, message = `Order ${orderId} was not found`) {
    super(message);
  }
}
