import type { IOrderProductOutput, IOrderRecordInput, IOrderSnapshotOutput } from '../interfaces';

export class OrderModel {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly products: readonly IOrderProductOutput[],
    public readonly createdAt: Date,
  ) {}

  public static reconstitute(record: IOrderRecordInput): OrderModel {
    const { id, customerId, createdAt, orderProducts } = record;
    const products = orderProducts.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      sku: orderProduct.product.sku,
      name: orderProduct.product.name,
    }));

    return new OrderModel(id, customerId, products, createdAt);
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
      customerId: this.customerId,
      createdAt: this.createdAt.toISOString(),
      products,
    };
  }
}
