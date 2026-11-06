import {
  IProductStockCoreLockProductRecord,
  IProductStockCoreLockSumRecord,
} from '../../../../outbound';
import { ProductStockCorePersistenceHost } from '../../host/product-stock-core-persistence.host';

export abstract class ProductStockCoreBaseRepository extends ProductStockCorePersistenceHost {
  public async lockProducts(productIds: string[]): Promise<IProductStockCoreLockProductRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.createProductBuilder().forLockProducts(productIds).getMany();
  }

  public async sumStock(productIds: string[]): Promise<IProductStockCoreLockSumRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.createProductStockBuilder()
      .forSumStock(productIds)
      .getRawMany<IProductStockCoreLockSumRecord>();
  }
}
