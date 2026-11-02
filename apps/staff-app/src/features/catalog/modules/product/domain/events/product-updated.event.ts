import { DomainEvent } from '@acme-libs/toolkit';

import { IProductChanges } from '../interfaces/product-changes.interface';

export class ProductUpdatedEvent extends DomainEvent<string> {
  constructor(
    productId: string,
    public readonly changes: IProductChanges,
    public readonly previous: IProductChanges,
  ) {
    super(productId);
  }
}
