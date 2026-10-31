import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductPublishedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly sku: string,
  ) {
    super(productId);
  }
}
