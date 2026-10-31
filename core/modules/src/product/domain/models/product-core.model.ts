import { ProductStatusEnum } from '@acme-libs/kernel';
import { IProductCoreRecord } from '../interfaces/product-core-record.interface';

export class ProductCoreModel {
  private constructor(
    public readonly id: string,
    public readonly sku: string,
    private currentStatus: ProductStatusEnum,
    private currentVersion: number,
  ) {}

  public static reconstitute(record: IProductCoreRecord): ProductCoreModel {
    const { id, sku, status, version } = record;

    return new ProductCoreModel(id, sku, status, version);
  }

  public get status(): ProductStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public get isArchived(): boolean {
    return this.currentStatus === ProductStatusEnum.ARCHIVED;
  }

  public archive(): void {
    if (this.isArchived) {
      return;
    }

    this.currentStatus = ProductStatusEnum.ARCHIVED;
    this.currentVersion += 1;
  }
}
