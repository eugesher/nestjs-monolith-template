import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductNameInvalidException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_NAME_INVALID;

  constructor(
    maxLength: number,
    message = `Product.name must be a non-empty string of at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
