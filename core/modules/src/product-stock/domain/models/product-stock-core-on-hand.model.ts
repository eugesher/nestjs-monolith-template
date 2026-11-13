import type {
  IProductStockCoreOnHandRecordInput,
  IProductStockCoreOnHandSnapshotOutput,
} from '../interfaces';

export class ProductStockCoreOnHandModel {
  private constructor(public readonly stock: readonly IProductStockCoreOnHandSnapshotOutput[]) {}

  public static reconstitute(
    record: IProductStockCoreOnHandRecordInput,
  ): ProductStockCoreOnHandModel {
    const { productIds, sums } = record;
    const stockOnHand = productIds.map((productId) => {
      const stockSum = sums.find((candidate) => candidate.productId === productId);

      return { productId, quantity: Number(stockSum?.quantity ?? 0) };
    });

    return new ProductStockCoreOnHandModel(stockOnHand);
  }

  public toSnapshot(): IProductStockCoreOnHandSnapshotOutput[] {
    return this.stock.map((unit) => ({ productId: unit.productId, quantity: unit.quantity }));
  }
}
