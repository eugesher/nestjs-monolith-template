import { ProductStatusEnum } from '@acme-libs/kernel';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export class ProductArchivedEvent extends DomainEvent<Maybe<string>> {
  constructor(
    productId: Maybe<string>,
    public readonly sku: string,
    public readonly previousStatus: ProductStatusEnum,
  ) {
    super(productId);
  }
}
