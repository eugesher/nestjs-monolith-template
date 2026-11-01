import { AggregateRoot } from '@acme-libs/toolkit';
import { ProductStockErrorCodeEnum } from '../enums/product-stock-error-code.enum';
import { ProductStockAddedEvent } from '../events/product-stock-added.event';
import { ProductStockDomainException } from '../exceptions/product-stock-domain.exception';
import { IProductStockRecord } from '../interfaces/product-stock-record.interface';

export class ProductStockModel extends AggregateRoot<string> {
  private static readonly ADD_MAX_QUANTITY = 100_000;

  private constructor(
    productId: string,
    public readonly sku: string,
  ) {
    super(productId);
  }

  public static reconstitute(record: IProductStockRecord): ProductStockModel {
    const { productId, sku } = record;

    return new ProductStockModel(productId, sku);
  }

  private static validQuantity(quantity: number): number {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > ProductStockModel.ADD_MAX_QUANTITY
    ) {
      throw new ProductStockDomainException(
        ProductStockErrorCodeEnum.PRODUCT_QUANTITY_INVALID,
        `Product restock quantity must be an integer from 1 to ${ProductStockModel.ADD_MAX_QUANTITY}, got ${quantity}`,
      );
    }

    return quantity;
  }

  public add(quantity: number): void {
    const validQuantity = ProductStockModel.validQuantity(quantity);
    const event = new ProductStockAddedEvent(this.id, this.sku, validQuantity);

    this.addDomainEvent(event);
  }
}
