import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductVersionInvalidException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_VERSION_INVALID;

  constructor(
    version: number,
    message = `Product.version must be a positive integer, got ${version}`,
  ) {
    super(message);
  }
}
