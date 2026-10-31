import { ProductStatusEnum } from '@acme-libs/kernel';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductPublishedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly sku: string,
    public readonly version: number,
    public readonly previousStatus: ProductStatusEnum,
  ) {
    super(productId);
  }
}
