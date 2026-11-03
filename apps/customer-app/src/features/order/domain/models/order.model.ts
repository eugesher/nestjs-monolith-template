import { AggregateRoot } from '@acme-libs/toolkit';

import { OrderEmptyException } from '../exceptions/order-empty.exception';
import { OrderProductNotFoundException } from '../exceptions/order-product-not-found.exception';
import { OrderStockInsufficientException } from '../exceptions/order-stock-insufficient.exception';
import { IOrderActiveProduct } from '../interfaces/order-active-product.interface';
import { IOrderCandidate } from '../interfaces/order-candidate.interface';
import { IOrderDraft } from '../interfaces/order-draft.interface';
import { IOrderMovement } from '../interfaces/order-movement.interface';
import { IOrderProduct } from '../interfaces/order-product.interface';
import { IOrderRecord } from '../interfaces/order-record.interface';
import { IOrderSnapshot } from '../interfaces/order-snapshot.interface';
import { IOrderStock } from '../interfaces/order-stock.interface';

export class OrderModel extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly customerId: string,
    public readonly products: readonly IOrderProduct[],
    public readonly createdAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: IOrderRecord): OrderModel {
    const { id, customerId, createdAt, orderProducts } = record;
    const products = orderProducts.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      sku: orderProduct.product.sku,
      name: orderProduct.product.name,
    }));

    return new OrderModel(id, customerId, products, createdAt);
  }

  public static createDraft(candidate: IOrderCandidate): IOrderDraft {
    const { customerId, productIds, products, stock } = candidate;

    if (productIds.length === 0) {
      throw new OrderEmptyException();
    }

    OrderModel.assertFound(productIds, products);
    OrderModel.assertInStock(productIds, stock);

    return { customerId, productIds: [...productIds] };
  }

  public getMovements(): IOrderMovement[] {
    return this.products.map((product) => ({
      productId: product.productId,
      orderProductId: product.id,
    }));
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

  private static assertFound(productIds: string[], products: IOrderActiveProduct[]): void {
    for (const productId of productIds) {
      const found = products.some((product) => product.id === productId);

      if (!found) {
        throw new OrderProductNotFoundException(productId);
      }
    }
  }

  private static assertInStock(productIds: string[], stock: IOrderStock[]): void {
    const distinctIds = new Set(productIds);

    for (const productId of distinctIds) {
      const requested = productIds.filter((id) => id === productId).length;
      const unit = stock.find((candidate) => candidate.productId === productId);
      const available = unit?.quantity ?? 0;

      if (requested > available) {
        throw new OrderStockInsufficientException(productId, requested, available);
      }
    }
  }
}
