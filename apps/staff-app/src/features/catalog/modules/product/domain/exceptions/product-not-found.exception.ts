import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';

import { ProductBaseException } from './base/product-base.exception';

export class ProductNotFoundException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_NOT_FOUND;

  constructor(productId: string, message = `Product ${productId} was not found`) {
    super(message);
  }
}
