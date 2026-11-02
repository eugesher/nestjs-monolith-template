import { DomainException } from '@acme-libs/toolkit';

import { ProductStockErrorCodeEnum } from '../../enums/product-stock-error-code.enum';

export abstract class ProductStockBaseException extends DomainException {
  public abstract override readonly code: ProductStockErrorCodeEnum;
}
