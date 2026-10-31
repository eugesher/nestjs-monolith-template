import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { IProductChanges } from '../interfaces/product-changes.interface';

export class ProductUpdatedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly changes: IProductChanges,
    public readonly previous: IProductChanges,
  ) {
    super(productId);
  }
}
