import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductTagNotFoundException extends ProductBaseException {
  public readonly code = ProductErrorCodeEnum.PRODUCT_TAG_NOT_FOUND;

  constructor(missingTagIds: string[], message = 'Some of the tags do not exist') {
    super(message, { missingTagIds });
  }
}
