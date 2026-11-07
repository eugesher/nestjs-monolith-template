import { ProductStockExceptionCodeEnum } from '../enums/product-stock-exception-code.enum';
import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductNotFoundException extends ProductStockBaseException {
  public readonly code = ProductStockExceptionCodeEnum.PRODUCT_NOT_FOUND;

  constructor(productId: string, message = `Product ${productId} was not found`) {
    super(message);
  }
}
