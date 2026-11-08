import { DomainEvent } from '@acme-libs/toolkit';

import { IProductChangesInput } from '../interfaces/inputs/product-changes.input';

export class ProductUpdatedEvent extends DomainEvent<string> {
  constructor(
    productId: string,
    public readonly changes: IProductChangesInput,
    public readonly previous: IProductChangesInput,
  ) {
    super(productId);
  }
}
