import { Maybe } from '@acme-libs/toolkit';

import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductVersionMismatchException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH;

  constructor(
    productId: string,
    currentVersion: Maybe<number>,
    message = `Product ${productId}: version does not match the current version ${String(currentVersion)}`,
  ) {
    super(message, { currentVersion });
  }
}
