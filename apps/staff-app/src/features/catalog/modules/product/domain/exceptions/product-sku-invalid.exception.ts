import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductSkuInvalidException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_SKU_INVALID;

  constructor(
    pattern: RegExp,
    sku: string,
    message = `Product.sku must match ${String(pattern)}, got ${sku}`,
  ) {
    super(message);
  }
}
