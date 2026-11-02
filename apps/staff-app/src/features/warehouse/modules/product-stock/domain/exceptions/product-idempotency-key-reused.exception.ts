import { ProductStockErrorCodeEnum } from '../enums/product-stock-error-code.enum';
import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductIdempotencyKeyReusedException extends ProductStockBaseException {
  public readonly code = ProductStockErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
  ) {
    super(message);
  }
}
