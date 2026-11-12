import { DomainEventBase } from '@acme-libs/toolkit';

import type { IProductChangesInput } from '../interfaces';

export class ProductUpdatedEvent extends DomainEventBase<string> {
  constructor(
    productId: string,
    public readonly changes: IProductChangesInput,
    public readonly previous: IProductChangesInput,
  ) {
    super(productId);
  }
}
