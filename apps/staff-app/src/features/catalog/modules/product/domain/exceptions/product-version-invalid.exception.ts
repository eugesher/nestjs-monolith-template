import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductVersionInvalidException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_VERSION_INVALID;

  constructor(
    version: number,
    message = `Product.version must be a positive integer, got ${version}`,
  ) {
    super(message);
  }
}
