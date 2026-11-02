import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';

import { ProductBaseException } from './base/product-base.exception';

export class ProductNotFoundException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_NOT_FOUND;

  constructor(productId: string, message = `Product ${productId} was not found`) {
    super(message);
  }
}
