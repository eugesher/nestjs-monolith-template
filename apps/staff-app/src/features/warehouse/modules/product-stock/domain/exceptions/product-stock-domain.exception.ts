import { DomainException, Maybe } from '@acme-libs-toolkit';

import { ProductStockErrorCodeEnum } from '../enums/product-stock-error-code.enum';

export class ProductStockDomainException extends DomainException {
  public readonly code: ProductStockErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: ProductStockErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
