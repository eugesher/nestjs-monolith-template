import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductSkuInvalidException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_SKU_INVALID;

  constructor(
    pattern: RegExp,
    sku: string,
    message = `Product.sku must match ${String(pattern)}, got ${sku}`,
  ) {
    super(message);
  }
}
