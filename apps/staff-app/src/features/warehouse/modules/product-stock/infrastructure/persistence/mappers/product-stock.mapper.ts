import { Product } from '@acme-core/entities';

import { ProductStockModel } from '../../../domain';

export class ProductStockMapper {
  public static toModel(entity: Product): ProductStockModel {
    return ProductStockModel.reconstitute({
      productId: entity.id,
      sku: entity.sku,
    });
  }
}
