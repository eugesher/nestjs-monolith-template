import { ProductStockErrorCodeEnum } from '../enums/product-stock-error-code.enum';
import { ProductStockBaseException } from './base/product-stock-base.exception';

export class ProductQuantityInvalidException extends ProductStockBaseException {
  public readonly code = ProductStockErrorCodeEnum.PRODUCT_QUANTITY_INVALID;

  constructor(
    maxQuantity: number,
    quantity: number,
    message = `Product restock quantity must be an integer from 1 to ${maxQuantity}, got ${quantity}`,
  ) {
    super(message);
  }
}
