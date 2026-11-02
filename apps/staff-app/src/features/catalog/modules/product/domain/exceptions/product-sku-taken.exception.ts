import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';

import { ProductBaseException } from './base/product-base.exception';

export class ProductSkuTakenException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_SKU_TAKEN;

  constructor(sku: string, message = `Product sku ${sku} is already registered`) {
    super(message);
  }
}
