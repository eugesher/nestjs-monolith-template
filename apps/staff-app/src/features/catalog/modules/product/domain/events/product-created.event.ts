import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductCreatedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly sku: string,
    public readonly name: string,
  ) {
    super(productId);
  }
}
