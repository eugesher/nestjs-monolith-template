import { DomainEvent } from '@acme-libs/toolkit';

import type { IProductChangesInput } from '../interfaces';

export class ProductUpdatedEvent extends DomainEvent<string> {
  constructor(
    productId: string,
    public readonly changes: IProductChangesInput,
    public readonly previous: IProductChangesInput,
  ) {
    super(productId);
  }
}
