import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderStockInsufficientException extends OrderBaseException {
  public readonly code = OrderErrorCodeEnum.ORDER_STOCK_INSUFFICIENT;

  constructor(
    productId: string,
    requested: number,
    available: number,
    message = `Product ${productId} has ${available} in stock, ${requested} requested`,
  ) {
    super(message, { productId, requested, available });
  }
}
