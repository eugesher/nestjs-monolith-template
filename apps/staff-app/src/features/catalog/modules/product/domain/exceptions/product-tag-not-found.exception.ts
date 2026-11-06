import { ProductExceptionCodeEnum } from '../enums/product-exception-code.enum';
import { ProductBaseException } from './base/product-base.exception';

export class ProductTagNotFoundException extends ProductBaseException {
  public readonly code = ProductExceptionCodeEnum.PRODUCT_TAG_NOT_FOUND;

  constructor(missingTagIds: string[], message = 'Some of the tags do not exist') {
    super(message, { missingTagIds });
  }
}
