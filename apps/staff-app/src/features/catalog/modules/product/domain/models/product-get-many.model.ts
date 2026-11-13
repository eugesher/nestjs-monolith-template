import type { ProductStatusEnum } from '@acme-libs/kernel';

import type { IProductGetManyRecordInput, IProductGetManySnapshotOutput } from '../interfaces';

export class ProductGetManyModel {
  private constructor(
    public readonly id: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly status: ProductStatusEnum,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static reconstitute(record: IProductGetManyRecordInput): ProductGetManyModel {
    const { id, sku, name, status, version, createdAt, updatedAt } = record;

    return new ProductGetManyModel(id, sku, name, status, version, createdAt, updatedAt);
  }

  public static toViewData(records: IProductGetManyRecordInput[]): IProductGetManySnapshotOutput[] {
    return records.map((record) => {
      const product = ProductGetManyModel.reconstitute(record);

      return product.toSnapshot();
    });
  }

  public toSnapshot(): IProductGetManySnapshotOutput {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
