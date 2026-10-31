import { Product } from '@acme-core/entities';
import { ProductCoreModel } from '../../../domain';

export class ProductCoreMapper {
  public static toModel(product: Product): ProductCoreModel {
    return ProductCoreModel.reconstitute({
      id: product.id,
      sku: product.sku,
      status: product.status,
      version: product.version,
    });
  }
}
