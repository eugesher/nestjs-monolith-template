import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderIdempotentRequestInFlightException extends OrderBaseException {
  public readonly code = OrderErrorCodeEnum.ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
  ) {
    super(message);
  }
}
