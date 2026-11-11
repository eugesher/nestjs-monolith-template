import { DomainException, type Maybe } from '@acme-libs/toolkit';

import type { ProductExceptionCodeEnum } from '../../enums/product-exception-code.enum';

export abstract class ProductBaseException extends DomainException {
  public abstract override readonly code: ProductExceptionCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
