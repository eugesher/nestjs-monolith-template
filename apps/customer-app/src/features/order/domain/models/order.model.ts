import { AggregateRoot, Maybe } from '@acme-libs/toolkit';

import { OrderEmptyException } from '../exceptions/order-empty.exception';
import { OrderProductNotFoundException } from '../exceptions/order-product-not-found.exception';
import { OrderStockInsufficientException } from '../exceptions/order-stock-insufficient.exception';
import { IOrderDraft } from '../interfaces/order-draft.interface';
import { IOrderInserted } from '../interfaces/order-inserted.interface';
import { IOrderProduct } from '../interfaces/order-product.interface';
import { IOrderRecord } from '../interfaces/order-record.interface';
import { IOrderStock } from '../interfaces/order-stock.interface';

export class OrderModel extends AggregateRoot<Maybe<string>> {
  private constructor(
    id: Maybe<string>,
    public readonly customerId: string,
    public readonly products: readonly IOrderProduct[],
    public readonly createdAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static place(draft: IOrderDraft): OrderModel {
    const { customerId, productIds, stock } = draft;

    if (productIds.length === 0) {
      throw new OrderEmptyException();
    }

    const units = productIds.map((productId) => OrderModel.requireStock(productId, stock));

    OrderModel.assertInStock(units);

    const products = units.map((unit) => ({
      id: undefined,
      productId: unit.productId,
      sku: unit.sku,
      name: unit.name,
    }));

    return new OrderModel(undefined, customerId, products, undefined);
  }

  public static fromInserted(placed: OrderModel, inserted: IOrderInserted): OrderModel {
    const { id, customerId, createdAt, products } = inserted;
    const records = products.map((row) => {
      const product = placed.products.find((candidate) => candidate.productId === row.productId);

      return {
        id: row.id,
        productId: row.productId,
        sku: product?.sku ?? '',
        name: product?.name ?? '',
      };
    });

    return new OrderModel(id, customerId, records, createdAt);
  }

  public static reconstitute(record: IOrderRecord): OrderModel {
    const { id, customerId, createdAt, products } = record;

    return new OrderModel(id, customerId, products, createdAt);
  }

  private static requireStock(productId: string, stock: IOrderStock[]): IOrderStock {
    const unit = stock.find((candidate) => candidate.productId === productId);

    if (unit === undefined) {
      throw new OrderProductNotFoundException(productId);
    }

    return unit;
  }

  private static assertInStock(units: IOrderStock[]): void {
    for (const unit of units) {
      const { productId, quantity } = unit;
      const requested = units.filter((other) => other.productId === productId).length;

      if (requested > quantity) {
        throw new OrderStockInsufficientException(productId, requested, quantity);
      }
    }
  }
}
