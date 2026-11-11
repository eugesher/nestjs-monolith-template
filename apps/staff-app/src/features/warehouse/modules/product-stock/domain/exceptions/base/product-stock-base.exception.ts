import { DomainException } from '@acme-libs/toolkit';

import type { ProductStockExceptionCodeEnum } from '../../enums/product-stock-exception-code.enum';

export abstract class ProductStockBaseException extends DomainException {
  public abstract override readonly code: ProductStockExceptionCodeEnum;
}
