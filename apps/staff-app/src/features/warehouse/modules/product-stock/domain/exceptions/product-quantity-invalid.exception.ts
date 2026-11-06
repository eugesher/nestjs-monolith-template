import { ProductStockExceptionCodeEnum } from '../enums/product-stock-exception-code.enum';
import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductQuantityInvalidException extends ProductStockBaseException {
  public readonly code = ProductStockExceptionCodeEnum.PRODUCT_QUANTITY_INVALID;

  constructor(
    maxQuantity: number,
    quantity: number,
    message = `Product restock quantity must be an integer from 1 to ${maxQuantity}, got ${quantity}`,
  ) {
    super(message);
  }
}
