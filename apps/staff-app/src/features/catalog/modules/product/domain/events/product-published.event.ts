import { ProductStatusEnum } from '@acme-libs/kernel';
import { DomainEvent } from '@acme-libs/toolkit';

export class ProductPublishedEvent extends DomainEvent<string> {
  constructor(
    productId: string,
    public readonly sku: string,
    public readonly version: number,
    public readonly previousStatus: ProductStatusEnum,
  ) {
    super(productId);
  }
}
