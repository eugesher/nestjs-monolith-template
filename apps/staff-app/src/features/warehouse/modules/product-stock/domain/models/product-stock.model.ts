import { AggregateRoot } from '@acme-libs/toolkit';

import { ProductStockAddedEvent } from '../events/product-stock-added.event';
import { ProductQuantityInvalidException } from '../exceptions/product-quantity-invalid.exception';
import { IProductStockRecordInput } from '../interfaces';

export class ProductStockModel extends AggregateRoot<string> {
  private static readonly ADD_MAX_QUANTITY = 100_000;

  private constructor(
    productId: string,
    public readonly sku: string,
  ) {
    super(productId);
  }

  public static reconstitute(record: IProductStockRecordInput): ProductStockModel {
    const { id, sku } = record;

    return new ProductStockModel(id, sku);
  }

  public add(quantity: number): void {
    const validQuantity = ProductStockModel.validQuantity(quantity);
    const event = new ProductStockAddedEvent(this.id, this.sku, validQuantity);

    this.addDomainEvent(event);
  }

  private static validQuantity(quantity: number): number {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > ProductStockModel.ADD_MAX_QUANTITY
    ) {
      throw new ProductQuantityInvalidException(ProductStockModel.ADD_MAX_QUANTITY, quantity);
    }

    return quantity;
  }
}
