import {
  IProductStockCoreOnHandRecordInput,
  IProductStockCoreOnHandSnapshotOutput,
} from '../interfaces';

export class ProductStockCoreOnHandModel {
  private constructor(public readonly stock: readonly IProductStockCoreOnHandSnapshotOutput[]) {}

  public static reconstitute(
    record: IProductStockCoreOnHandRecordInput,
  ): ProductStockCoreOnHandModel {
    const { productIds, sums } = record;
    const stock = productIds.map((productId) => {
      const sum = sums.find((candidate) => candidate.productId === productId);

      return { productId, quantity: Number(sum?.quantity ?? 0) };
    });

    return new ProductStockCoreOnHandModel(stock);
  }

  public toSnapshot(): IProductStockCoreOnHandSnapshotOutput[] {
    return this.stock.map((unit) => ({ productId: unit.productId, quantity: unit.quantity }));
  }
}
