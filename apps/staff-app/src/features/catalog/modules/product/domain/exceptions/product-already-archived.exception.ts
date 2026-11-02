import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';

import { ProductBaseException } from './base/product-base.exception';

export class ProductAlreadyArchivedException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_ALREADY_ARCHIVED;

  constructor(productId: string, message = `Product ${productId} is already archived`) {
    super(message);
  }
}
