import { AggregateRoot } from '@acme-libs/toolkit';

import { OrderEmptyException } from '../exceptions/order-empty.exception';
import { OrderProductNotFoundException } from '../exceptions/order-product-not-found.exception';
import { OrderStockInsufficientException } from '../exceptions/order-stock-insufficient.exception';
import { IOrderCandidate } from '../interfaces/order-candidate.interface';
import { IOrderDraft } from '../interfaces/order-draft.interface';
import { IOrderProductRecord } from '../interfaces/order-product-record.interface';
import { IOrderRecord } from '../interfaces/order-record.interface';
import { IOrderSnapshot } from '../interfaces/order-snapshot.interface';
import { IOrderStock } from '../interfaces/order-stock.interface';

export class OrderModel extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly customerId: string,
    public readonly products: readonly IOrderProductRecord[],
    public readonly createdAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: IOrderRecord): OrderModel {
    const { id, customerId, createdAt, products } = record;

    return new OrderModel(id, customerId, products, createdAt);
  }

  public static createDraft(candidate: IOrderCandidate): IOrderDraft {
    const { customerId, productIds, stock } = candidate;

    if (productIds.length === 0) {
      throw new OrderEmptyException();
    }

    const units = productIds.map((productId) => OrderModel.requireStock(productId, stock));

    OrderModel.assertInStock(units);

    return { customerId, productIds: [...productIds] };
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

  public toView(): IOrderSnapshot {
    const products = this.products.map((product) => ({
      id: product.id,
      productId: product.productId,
      sku: product.sku,
      name: product.name,
    }));

    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      products,
    };
  }
}
