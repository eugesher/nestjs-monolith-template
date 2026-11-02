import { DomainException, Maybe } from '@acme-libs/toolkit';

import { ProductErrorCodeEnum } from '../../enums/product-error-code.enum';

export abstract class ProductBaseException extends DomainException {
  public abstract override readonly code: ProductErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
