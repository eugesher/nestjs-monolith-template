import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductRenamedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly name: string,
    public readonly previousName: string,
  ) {
    super(productId);
  }
}
