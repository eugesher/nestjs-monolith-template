import { AggregateRootBase } from '@acme-libs/toolkit';

import { OrderEmptyException } from '../exceptions/order-empty.exception';
import { OrderProductNotFoundException } from '../exceptions/order-product-not-found.exception';
import { OrderStockInsufficientException } from '../exceptions/order-stock-insufficient.exception';
import type {
  IOrderActiveProductInput,
  IOrderCandidateInput,
  IOrderDraftOutput,
  IOrderMovementOutput,
  IOrderProductOutput,
  IOrderRecordInput,
  IOrderSnapshotOutput,
  IOrderStockInput,
} from '../interfaces';

export class OrderModel extends AggregateRootBase<string> {
  private constructor(
    id: string,
    public readonly products: readonly IOrderProductOutput[],
    public readonly createdAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: IOrderRecordInput): OrderModel {
    const { id, createdAt, orderProducts } = record;
    const products = orderProducts.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      sku: orderProduct.product.sku,
      name: orderProduct.product.name,
    }));

    return new OrderModel(id, products, createdAt);
  }

  public static createDraft(candidate: IOrderCandidateInput): IOrderDraftOutput {
    const { customerId, productIds, products, stock } = candidate;

    if (productIds.length === 0) {
      throw new OrderEmptyException();
    }

    OrderModel.assertFound(productIds, products);
    OrderModel.assertInStock(productIds, stock);

    return { customerId, productIds: [...productIds] };
  }

  public getMovements(): IOrderMovementOutput[] {
    return this.products.map((product) => ({
      productId: product.productId,
      orderProductId: product.id,
    }));
  }

  public toSnapshot(): IOrderSnapshotOutput {
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

  private static assertFound(productIds: string[], products: IOrderActiveProductInput[]): void {
    for (const productId of productIds) {
      const found = products.some((product) => product.id === productId);

      if (!found) {
        throw new OrderProductNotFoundException(productId);
      }
    }
  }

  private static assertInStock(productIds: string[], stock: IOrderStockInput[]): void {
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
