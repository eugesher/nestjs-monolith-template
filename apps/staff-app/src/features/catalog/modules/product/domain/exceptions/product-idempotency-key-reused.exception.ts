import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductIdempotencyKeyReusedException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
  ) {
    super(message);
  }
}
