import { ProductStockErrorCodeEnum } from '../enums/product-stock-error-code.enum';

import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductNotFoundException extends ProductStockBaseException {
  public readonly code = ProductStockErrorCodeEnum.PRODUCT_NOT_FOUND;

  constructor(productId: string, message = `Product ${productId} was not found`) {
    super(message);
  }
}
