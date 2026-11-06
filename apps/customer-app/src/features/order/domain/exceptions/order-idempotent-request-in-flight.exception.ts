import { OrderExceptionCodeEnum } from '../enums/order-exception-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderIdempotentRequestInFlightException extends OrderBaseException {
  public readonly code = OrderExceptionCodeEnum.ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
  ) {
    super(message);
  }
}
