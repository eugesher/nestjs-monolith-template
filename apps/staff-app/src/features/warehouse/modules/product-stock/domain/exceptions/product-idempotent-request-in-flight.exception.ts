import { ProductStockExceptionCodeEnum } from '../enums/product-stock-exception-code.enum';
import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductIdempotentRequestInFlightException extends ProductStockBaseException {
  public readonly code = ProductStockExceptionCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT;

  constructor(
    idempotencyKey: string,
    message = `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
  ) {
    super(message);
  }
}
