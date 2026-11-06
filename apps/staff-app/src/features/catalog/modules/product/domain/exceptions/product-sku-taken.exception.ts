import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';

import { ProductBaseException } from './base/product-base.exception';

export class ProductSkuTakenException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_SKU_TAKEN;

  constructor(sku: string, message = `Product sku ${sku} is already registered`) {
    super(message);
  }
}
