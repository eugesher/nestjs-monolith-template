import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductIdempotentRequestInFlightException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
  ) {
    super(message);
  }
}
