import { OrderExceptionCodeEnum } from '../enums/order-exception-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderIdempotencyKeyReusedException extends OrderBaseException {
  public readonly code = OrderExceptionCodeEnum.ORDER_IDEMPOTENCY_KEY_REUSED;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
  ) {
    super(message);
  }
}
