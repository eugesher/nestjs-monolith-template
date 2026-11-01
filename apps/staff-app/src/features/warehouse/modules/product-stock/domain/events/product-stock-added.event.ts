import { DomainEvent } from '@acme-libs/toolkit';

export class ProductStockAddedEvent extends DomainEvent<string> {
  constructor(
    productId: string,
    public readonly sku: string,
    public readonly quantity: number,
  ) {
    super(productId);
  }
}
