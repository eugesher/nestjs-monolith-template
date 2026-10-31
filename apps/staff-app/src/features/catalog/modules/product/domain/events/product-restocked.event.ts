import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductRestockedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly sku: string,
    public readonly quantity: number,
  ) {
    super(productId);
  }
}
