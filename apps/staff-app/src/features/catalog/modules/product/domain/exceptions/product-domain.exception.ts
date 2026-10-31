import { DomainException, Maybe } from '@acme-libs/toolkit';
import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';

export class ProductDomainException extends DomainException {
  public readonly code: ProductErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: ProductErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
